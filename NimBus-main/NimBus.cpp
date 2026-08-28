// NimBus 1.0 - interactive, portable C++ console edition
#include <algorithm>
#include <cctype>
#include <cstdlib>
#include <ctime>
#include <fstream>
#include <iomanip>
#include <iostream>
#include <limits>
#include <map>
#include <random>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

namespace {

const char* SCORE_FILE = "nimbus_scores.tsv";

struct Move {
    std::size_t pile;
    int amount;
    Move(std::size_t p = 0, int a = 0) : pile(p), amount(a) {}
};

struct ScoreRecord {
    std::string date, mode, player1, player2;
    int score1, score2;
    std::string winner;
};

std::mt19937 rng(static_cast<unsigned int>(std::time(NULL)));
std::map<std::vector<int>, int> nimBusMemo;

std::string trim(const std::string& value) {
    std::size_t first = value.find_first_not_of(" \t\r\n");
    if (first == std::string::npos) return "";
    std::size_t last = value.find_last_not_of(" \t\r\n");
    return value.substr(first, last - first + 1);
}

std::string readLine(const std::string& prompt) {
    std::cout << prompt;
    std::string line;
    if (!std::getline(std::cin, line)) {
        std::cout << "\nInput closed. Goodbye!\n";
        std::exit(0);
    }
    return trim(line);
}

bool parseInt(const std::string& text, int& value) {
    std::istringstream input(text);
    char extra;
    return (input >> value) && !(input >> extra);
}

int readInt(const std::string& prompt, int minimum, int maximum) {
    for (;;) {
        int value = 0;
        std::string text = readLine(prompt);
        if (parseInt(text, value) && value >= minimum && value <= maximum) return value;
        std::cout << "Please enter a whole number from " << minimum << " to " << maximum << ".\n";
    }
}

std::string readName(const std::string& prompt, const std::string& fallback) {
    std::string name = readLine(prompt);
    return name.empty() ? fallback : name;
}

void waitForEnter() { readLine("\nPress Enter to continue..."); }

void divider() {
    std::cout << "\n============================================================\n";
}

std::vector<int> normalized(std::vector<int> piles) {
    piles.erase(std::remove(piles.begin(), piles.end(), 0), piles.end());
    std::sort(piles.begin(), piles.end());
    return piles;
}

bool finished(const std::vector<int>& piles) {
    for (std::size_t i = 0; i < piles.size(); ++i)
        if (piles[i] > 0) return false;
    return true;
}

int remainingObjects(const std::vector<int>& piles) {
    int total = 0;
    for (std::size_t i = 0; i < piles.size(); ++i) total += piles[i];
    return total;
}

std::vector<int> createPiles(int count) {
    std::uniform_int_distribution<int> size(5, 9);
    std::vector<int> piles(static_cast<std::size_t>(count));
    for (int i = 0; i < count; ++i) piles[static_cast<std::size_t>(i)] = size(rng);
    return piles;
}

void showBoard(const std::vector<int>& piles) {
    divider();
    std::cout << "                         N I M B U S\n"
              << "------------------------------------------------------------\n";
    for (std::size_t i = 0; i < piles.size(); ++i) {
        std::cout << "Pile " << std::setw(2) << (i + 1) << "  ";
        if (piles[i] == 0) std::cout << "(cleared)";
        else std::cout << std::string(static_cast<std::size_t>(piles[i]), 'O') << "  [" << piles[i] << "]";
        std::cout << '\n';
    }
    std::cout << "------------------------------------------------------------\n"
              << "Objects remaining: " << remainingObjects(piles) << "\n";
}

std::size_t choosePile(const std::vector<int>& piles, const std::string& player) {
    for (;;) {
        int choice = readInt(player + ", choose a pile: ", 1, static_cast<int>(piles.size()));
        if (piles[static_cast<std::size_t>(choice - 1)] > 0) return static_cast<std::size_t>(choice - 1);
        std::cout << "That pile has already been cleared. Choose another one.\n";
    }
}

Move humanMove(const std::vector<int>& piles, const std::string& player,
               bool specialAvailable, bool& usedSpecial) {
    std::size_t pile = choosePile(piles, player);
    int normalLimit = std::min(2, piles[pile]);
    usedSpecial = false;
    if (specialAvailable && piles[pile] > normalLimit) {
        std::string answer = readLine("Use your one-time power move on this pile? (y/N): ");
        if (!answer.empty() && std::tolower(static_cast<unsigned char>(answer[0])) == 'y') {
            usedSpecial = true;
            return Move(pile, readInt("How many objects will you remove? ", 1, piles[pile]));
        }
    }
    return Move(pile, readInt("Remove how many objects (1 or 2)? ", 1, normalLimit));
}

// Exact scoring-play solver. Its value is the best final point difference
// available to the player whose turn it is. A cleared pile scores immediately;
// the recursive value is subtracted because the opponent moves next.
int solveNimBus(const std::vector<int>& rawState) {
    std::vector<int> state = normalized(rawState);
    if (state.empty()) return 0;
    std::map<std::vector<int>, int>::const_iterator cached = nimBusMemo.find(state);
    if (cached != nimBusMemo.end()) return cached->second;

    int best = std::numeric_limits<int>::min();
    for (std::size_t pile = 0; pile < state.size(); ++pile) {
        for (int amount = 1; amount <= 2 && amount <= state[pile]; ++amount) {
            std::vector<int> next = state;
            next[pile] -= amount;
            int point = next[pile] == 0 ? 1 : 0;
            best = std::max(best, point - solveNimBus(next));
        }
    }
    nimBusMemo[state] = best;
    return best;
}

Move bestNimBusMove(const std::vector<int>& piles) {
    Move bestMove;
    int bestValue = std::numeric_limits<int>::min();
    bool found = false;
    for (std::size_t pile = 0; pile < piles.size(); ++pile) {
        for (int amount = 1; amount <= 2 && amount <= piles[pile]; ++amount) {
            std::vector<int> next = piles;
            next[pile] -= amount;
            int point = next[pile] == 0 ? 1 : 0;
            int value = point - solveNimBus(next);
            if (!found || value > bestValue) {
                found = true;
                bestValue = value;
                bestMove = Move(pile, amount);
            }
        }
    }
    if (!found) throw std::logic_error("AI was asked to move on a finished board");
    return bestMove;
}

Move bestTraditionalNimMove(const std::vector<int>& piles) {
    int nimSum = 0;
    for (std::size_t i = 0; i < piles.size(); ++i) nimSum ^= piles[i];
    if (nimSum != 0) {
        for (std::size_t pile = 0; pile < piles.size(); ++pile) {
            int target = piles[pile] ^ nimSum;
            if (target < piles[pile]) return Move(pile, piles[pile] - target);
        }
    }
    for (std::size_t pile = 0; pile < piles.size(); ++pile)
        if (piles[pile] > 0) return Move(pile, 1);
    throw std::logic_error("AI was asked to move on a finished board");
}

std::string nowText() {
    std::time_t now = std::time(NULL);
    std::tm* local = std::localtime(&now);
    std::ostringstream output;
    output << std::put_time(local, "%Y-%m-%d %H:%M");
    return output.str();
}

std::string safeField(std::string value) {
    std::replace(value.begin(), value.end(), '\t', ' ');
    std::replace(value.begin(), value.end(), '\n', ' ');
    std::replace(value.begin(), value.end(), '\r', ' ');
    return value;
}

void saveScore(const std::string& mode, const std::string& player1,
               const std::string& player2, int score1, int score2,
               const std::string& winner) {
    std::ofstream output(SCORE_FILE, std::ios::app);
    if (!output) {
        std::cout << "Warning: the score history could not be saved.\n";
        return;
    }
    output << nowText() << '\t' << safeField(mode) << '\t'
           << safeField(player1) << '\t' << safeField(player2) << '\t'
           << score1 << '\t' << score2 << '\t' << safeField(winner) << '\n';
}

std::vector<ScoreRecord> loadScores() {
    std::ifstream input(SCORE_FILE);
    std::vector<ScoreRecord> records;
    std::string line;
    while (std::getline(input, line)) {
        std::istringstream row(line);
        ScoreRecord record;
        std::string score1, score2;
        if (std::getline(row, record.date, '\t') && std::getline(row, record.mode, '\t') &&
            std::getline(row, record.player1, '\t') && std::getline(row, record.player2, '\t') &&
            std::getline(row, score1, '\t') && std::getline(row, score2, '\t') &&
            std::getline(row, record.winner) && parseInt(score1, record.score1) &&
            parseInt(score2, record.score2)) records.push_back(record);
    }
    return records;
}

int choosePileCount() {
    std::cout << "\nChoose the number of piles:\n"
              << "  1. 3 piles (quick)\n  2. 5 piles (standard)\n"
              << "  3. 7 piles (long)\n  4. 9 piles (marathon)\n";
    const int options[] = {3, 5, 7, 9};
    return options[readInt("Choice: ", 1, 4) - 1];
}

void playNimBus(bool versusAI, bool specialMode) {
    divider();
    std::cout << (specialMode ? "SPECIAL NIMBUS" : versusAI ? "NIMBUS VS COMPUTER" : "TWO-PLAYER NIMBUS") << "\n"
              << "Clear a pile to score. Remove 1 or 2 objects per turn.\n";
    if (specialMode) std::cout << "Each player also has one power move that may remove any amount.\n";

    std::string names[2];
    names[0] = readName("Player 1 name: ", "Player 1");
    names[1] = versusAI ? "Nimbus AI" : readName("Player 2 name: ", "Player 2");
    std::vector<int> piles = createPiles(choosePileCount());
    int scores[2] = {0, 0};
    bool powerAvailable[2] = {specialMode, specialMode};
    std::uniform_int_distribution<int> coin(0, 1);
    int player = coin(rng);
    std::cout << "\n" << names[player] << " won the toss and moves first.\n";
    waitForEnter();

    while (!finished(piles)) {
        showBoard(piles);
        std::cout << "Score: " << names[0] << " " << scores[0] << " - " << scores[1] << " " << names[1] << "\n\n";
        Move move;
        bool usedSpecial = false;
        if (versusAI && player == 1) {
            move = bestNimBusMove(piles);
            std::cout << "Nimbus AI removes " << move.amount << " from pile " << (move.pile + 1) << ".\n";
        } else {
            move = humanMove(piles, names[player], powerAvailable[player], usedSpecial);
            if (usedSpecial) powerAvailable[player] = false;
        }
        piles[move.pile] -= move.amount;
        if (piles[move.pile] == 0) {
            ++scores[player];
            std::cout << names[player] << " cleared pile " << (move.pile + 1) << " and scored!\n";
        }
        if (!finished(piles)) player = 1 - player;
    }

    showBoard(piles);
    std::cout << "Final score: " << names[0] << " " << scores[0] << " - " << scores[1] << " " << names[1] << "\n";
    std::string winner = scores[0] > scores[1] ? names[0] : names[1];
    std::cout << "Winner: " << winner << "!\n";
    saveScore(specialMode ? "Special NimBus" : versusAI ? "AI NimBus" : "NimBus",
              names[0], names[1], scores[0], scores[1], winner);
    waitForEnter();
}

void playTraditionalNim(bool versusAI) {
    divider();
    std::cout << (versusAI ? "TRADITIONAL NIM VS COMPUTER" : "TWO-PLAYER TRADITIONAL NIM") << "\n"
              << "Remove any positive number from one pile. Clearing the final object wins.\n";
    std::string names[2];
    names[0] = readName("Player 1 name: ", "Player 1");
    names[1] = versusAI ? "Nim AI" : readName("Player 2 name: ", "Player 2");
    std::vector<int> piles = createPiles(choosePileCount());
    std::uniform_int_distribution<int> coin(0, 1);
    int player = coin(rng);
    std::cout << "\n" << names[player] << " won the toss and moves first.\n";
    waitForEnter();

    while (!finished(piles)) {
        showBoard(piles);
        Move move;
        if (versusAI && player == 1) {
            move = bestTraditionalNimMove(piles);
            std::cout << "Nim AI removes " << move.amount << " from pile " << (move.pile + 1) << ".\n";
        } else {
            std::size_t pile = choosePile(piles, names[player]);
            move = Move(pile, readInt("How many objects will you remove? ", 1, piles[pile]));
        }
        piles[move.pile] -= move.amount;
        if (finished(piles)) break;
        player = 1 - player;
    }

    showBoard(piles);
    std::cout << names[player] << " took the final object and won!\n";
    saveScore(versusAI ? "AI Nim" : "Nim", names[0], names[1],
              player == 0 ? 1 : 0, player == 1 ? 1 : 0, names[player]);
    waitForEnter();
}

void showScores() {
    divider();
    std::cout << "SCORE HISTORY\n\n";
    std::vector<ScoreRecord> records = loadScores();
    if (records.empty()) {
        std::cout << "No completed games yet.\n";
        waitForEnter();
        return;
    }
    std::size_t first = records.size() > 15 ? records.size() - 15 : 0;
    for (std::size_t i = first; i < records.size(); ++i) {
        const ScoreRecord& item = records[i];
        std::cout << item.date << " | " << item.mode << " | " << item.player1 << " "
                  << item.score1 << " - " << item.score2 << " " << item.player2
                  << " | Winner: " << item.winner << '\n';
    }

    std::map<std::string, int> wins;
    for (std::size_t i = 0; i < records.size(); ++i) ++wins[records[i].winner];
    std::vector<std::pair<int, std::string> > ranking;
    for (std::map<std::string, int>::const_iterator it = wins.begin(); it != wins.end(); ++it)
        ranking.push_back(std::make_pair(it->second, it->first));
    std::sort(ranking.begin(), ranking.end(), std::greater<std::pair<int, std::string> >());
    std::cout << "\nLEADERBOARD\n";
    std::size_t limit = std::min<std::size_t>(5, ranking.size());
    for (std::size_t i = 0; i < limit; ++i)
        std::cout << "  " << (i + 1) << ". " << ranking[i].second << " - " << ranking[i].first << " win(s)\n";
    waitForEnter();
}

void showRules() {
    divider();
    std::cout << "HOW TO PLAY\n\n"
              << "NimBus\n  Players alternate removing 1 or 2 objects from one pile.\n"
              << "  Clearing a pile earns one point. An odd pile count prevents ties.\n\n"
              << "Special NimBus\n  Each player may once remove any positive number from a pile.\n\n"
              << "Traditional Nim\n  Remove any positive number from one pile. Taking the final object wins.\n\n"
              << "Computer strategy\n  Nimbus AI solves the complete scoring state. Nim AI uses the XOR strategy.\n";
    waitForEnter();
}

void playMenu() {
    for (;;) {
        divider();
        std::cout << "CHOOSE A GAME\n\n"
                  << "  1. NimBus vs computer\n  2. Two-player NimBus\n"
                  << "  3. Traditional Nim vs computer\n  4. Two-player Traditional Nim\n"
                  << "  5. Special two-player NimBus\n  0. Back\n\n";
        int choice = readInt("Choice: ", 0, 5);
        if (choice == 0) return;
        if (choice == 1) playNimBus(true, false);
        else if (choice == 2) playNimBus(false, false);
        else if (choice == 3) playTraditionalNim(true);
        else if (choice == 4) playTraditionalNim(false);
        else playNimBus(false, true);
    }
}

int evaluateMove(const std::vector<int>& piles, const Move& move) {
    std::vector<int> next = piles;
    next[move.pile] -= move.amount;
    return (next[move.pile] == 0 ? 1 : 0) - solveNimBus(next);
}

bool runSelfTests() {
    if (solveNimBus(std::vector<int>()) != 0) return false;
    if (solveNimBus(std::vector<int>(1, 1)) != 1) return false;
    if (solveNimBus(std::vector<int>(1, 2)) != 1) return false;
    if (solveNimBus(std::vector<int>(1, 3)) != -1) return false;

    std::vector<int> marathon(9, 9);
    Move marathonMove = bestNimBusMove(marathon);
    if (marathonMove.pile >= marathon.size() || marathonMove.amount < 1 || marathonMove.amount > 2) return false;

    for (int a = 0; a <= 5; ++a) for (int b = 0; b <= 5; ++b)
    for (int c = 0; c <= 5; ++c) for (int d = 0; d <= 5; ++d) {
        std::vector<int> state;
        state.push_back(a); state.push_back(b); state.push_back(c); state.push_back(d);
        if (finished(state)) continue;
        Move move = bestNimBusMove(state);
        if (move.pile >= state.size() || move.amount < 1 || move.amount > 2 || move.amount > state[move.pile]) return false;
        if (evaluateMove(state, move) != solveNimBus(state)) return false;
    }

    std::vector<int> traditional;
    traditional.push_back(3); traditional.push_back(4); traditional.push_back(5);
    Move nimMove = bestTraditionalNimMove(traditional);
    traditional[nimMove.pile] -= nimMove.amount;
    int nimSum = 0;
    for (std::size_t i = 0; i < traditional.size(); ++i) nimSum ^= traditional[i];
    return nimSum == 0;
}

} // namespace

int main(int argc, char* argv[]) {
    if (argc > 1 && std::string(argv[1]) == "--self-test") {
        bool passed = runSelfTests();
        std::cout << (passed ? "All NimBus self-tests passed.\n" : "NimBus self-tests failed.\n");
        return passed ? 0 : 1;
    }

    std::cout << "\n  _   _ _           ____             \n"
              << " | \\ | (_)_ __ ___ | __ ) _   _ ___ \n"
              << " |  \\| | | '_ ` _ \\|  _ \\| | | / __|\n"
              << " | |\\  | | | | | | | |_) | |_| \\__ \\\n"
              << " |_| \\_|_|_| |_| |_|____/ \\__,_|___/\n";

    for (;;) {
        divider();
        std::cout << "MAIN MENU\n\n"
                  << "  1. Play\n  2. Score history and leaderboard\n"
                  << "  3. How to play\n  4. Credits\n  0. Quit\n\n";
        int choice = readInt("Choice: ", 0, 4);
        if (choice == 0) break;
        if (choice == 1) playMenu();
        else if (choice == 2) showScores();
        else if (choice == 3) showRules();
        else {
            divider();
            std::cout << "NimBus\n\nOriginal project: Rahman Aashnan, Aziz Syem, Hasan Moudud\n"
                      << "Interactive edition with corrected optimal AI.\n";
            waitForEnter();
        }
    }
    std::cout << "\nThanks for playing NimBus!\n";
    return 0;
}
