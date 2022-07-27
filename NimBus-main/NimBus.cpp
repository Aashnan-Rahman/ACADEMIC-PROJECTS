//version 0.3.6
/*
*changelog*
minor changes

*/

#include <bits/stdc++.h>
#define pb push_back

using namespace std;

vector<int>init_stacks(int n)
{
    vector<int>stacks;
    srand(time(NULL));
    stacks.push_back(0);
    for(int i=0; i<n; i++)
    {

        int x=rand()%10;
        if(x<5)
            x+=5;
        stacks.push_back(x);
    }
    return stacks;
}
int toss()
{
    srand(time(NULL));
    int ret=rand()%2;
    return ret+1;
}

void delay(int n)
{
    for(int i=0; i<n*100000000; i++);
}

void addToLeaderboard(string ss,int type)
{
    char s[ss.length()+1];
    memset(s,0,sizeof s);
    for(int i=0; i<ss.length(); i++)
        s[i]=ss[i];
    FILE *myOpenLeaderFile;
    if(type==1)
        myOpenLeaderFile=fopen("leaderboard_regularNimBus.txt", "a");
    else if(type==2)
        myOpenLeaderFile=fopen("leaderboard_Nim.txt", "a");
    else if(type==3)
        myOpenLeaderFile=fopen("leaderboard_AINimBus.txt", "a");
    else
        myOpenLeaderFile=fopen("leaderboard_specialNimBus.txt", "a");
    fprintf(myOpenLeaderFile,"%s\n",s);
    fclose(myOpenLeaderFile);
}

void addToScoreboard(string player1_name,string player2_name,int score1,int score2,int type)
{
    int n1=player1_name.length(),n2=player2_name.length();
    char s1[n1+1],s2[n2+1];
    memset(s1,0, sizeof s1);
    memset(s2,0,sizeof s2);
    for(int i=0; i<n1; i++)
        s1[i]=player1_name[i];
    for(int i=0; i<n2; i++)
        s2[i]=player2_name[i];
    FILE *scoreboardFile = fopen("scoreboard.txt", "a");
    if(type==1)
        fprintf(scoreboardFile, "NimBus       ");
    else if(type==2)
        fprintf(scoreboardFile, "Nim           ");
    else if(type==3)
        fprintf(scoreboardFile, "AI NimBus     ");
    else if(type==4)
        fprintf(scoreboardFile, "Special NimBus  ");
    fprintf(scoreboardFile, "%s %s   %s VS %s    %d : %d   ",__DATE__,__TIME__,s1,s2,score1,score2);
    if(score1>score2)
        fprintf(scoreboardFile, "%s\n",s1);
    else
        fprintf(scoreboardFile, "%s\n",s2);
    fclose(scoreboardFile);
    if(score1>score2)
        addToLeaderboard(player1_name,type);
    else
        addToLeaderboard(player2_name,type);
/// output format: GAME MODE  DATE TIME Player1 VS Player2 Score Winner
}


void NIM_bus()///Regular NIM-bus
{
    cout<<"Regular NIM-bus starting.\n\n";
    srand(time(NULL));
    int total_stack=rand()%10;
    if(total_stack<5)
        total_stack+=5;
    if(total_stack%2==0)
        total_stack++;
    getchar();
    string player1_name,player2_name;
    cout<<"Enter name of Player1: ";
    getline(cin,player1_name);
    cout<<endl;
    cout<<"Enter name of Player2: ";
    getline(cin,player2_name);
    cout<<endl;
    int turn=0,player=0,nonempty_stack=total_stack,score[10]= {0};
    vector<int>stacks=init_stacks(total_stack);
    player=toss();
    if(player==1)
        cout<<player1_name;
    else
        cout<<player2_name;
    cout<<" goes first.\n";
    printf("There are %d stacks in total.\n\n",total_stack);
    cout<<"Prepare for the match!\n";
    system("PAUSE");

    while(nonempty_stack)
    {
        system("CLS");
        cout<<"Current score: "<<score[1]<<"  :  "<<score[2]<<endl<<endl;
        cout<<"Stack Number:  ";for(int i=1;i<=total_stack;i++)cout<<i<<"  ";cout<<endl;
        cout<<"Stack State :  ";
        for(int i=1; i<=total_stack; i++)
            printf("%d  ",stacks[i]);
        cout<<endl<<endl;
        int chosen_stack,chosen_disk;
        if(player==1)
            cout<<player1_name;
        else
            cout<<player2_name;
        cout<<", which stack do you choose: ";
        cin>>chosen_stack;
        if(chosen_stack>total_stack||chosen_stack<1|| stacks[chosen_stack]==0)
        {
            if(stacks[chosen_stack]==0)
                cout<<"Error! Stack is empty. ";
            else
                cout<<"Error! Invalid stack number given. ";
            cout<<"Please retry.\n";
            delay(7);
            continue;
        }
        cout<<"How many disk do you want to remove(1 or 2): ";
        cin>>chosen_disk;
        if(stacks[chosen_stack]<chosen_disk|| chosen_disk>2|| chosen_disk<1)
        {
            if(stacks[chosen_stack]<chosen_disk)
                cout<<"Error! You can not remove more disk than the stack contains. ";
            else
                cout<<"Error! Invalid disk number. ";
            cout<<"Please retry.\n";
            delay(7);
            continue;
        }
        delay(5);
        //system("CLS");
        stacks[chosen_stack]-=chosen_disk;
        if(stacks[chosen_stack]==0)
            score[player]++,nonempty_stack--;
        if(nonempty_stack==0)
            break;
        player=player==1?2:1;


    }
    cout<<"\nCongratulations! \n\n";
    cout<<(score[1]>score[2]?player1_name:player2_name );
    cout<<" You have won the game.\n\n";
    printf("Final score: ");
    cout<<player1_name<<"( "<<score[1]<<" )   ";
    cout<<player2_name<<"( "<<score[2]<<" )\n\n";
    int p1sc=score[1];
    int p2sc=score[2];
    addToScoreboard(player1_name,player2_name,p1sc,p2sc,1);
    system("PAUSE");
    system("CLS");
}

void NIM()///Regular NIM
{
    srand(time(NULL));
    int total_stack=rand()%10;
    if(total_stack<5)
        total_stack+=5;
    if(total_stack%2==0)
        total_stack++;
    getchar();
    string player1_name,player2_name;
    cout<<"Enter name of Player1: ";
    getline(cin,player1_name);
    cout<<"Enter name of Player2: ";
    getline(cin,player2_name);
    cout<<endl;
    int turn=0,player=0,nonempty_stack=total_stack;
    vector<int>stacks=init_stacks(total_stack);
    player=toss();
    if(player==1)
        cout<<player1_name;
    else
        cout<<player2_name;
    cout<<" goes first.\n";
    printf("There are %d stacks in total.\n\n",total_stack);

    cout<<"Prepare for the match!\n";
    system("PAUSE");
    while(nonempty_stack)
    {
        cout<<"\n\n";
        system("CLS");
        cout<<"Stack Number:  ";for(int i=1;i<=total_stack;i++)cout<<i<<"  ";cout<<endl;
        cout<<"Stack State :  ";
        for(int i=1; i<=total_stack; i++)
            printf("%d  ",stacks[i]);
        cout<<endl<<endl;
        int chosen_stack,chosen_disk;
        if(player==1)
            cout<<player1_name;
        else
            cout<<player2_name;
        cout<<", which stack do you choose: ";
        cin>>chosen_stack;
        if(chosen_stack>total_stack||chosen_stack<1|| stacks[chosen_stack]==0)
        {
            if(stacks[chosen_stack]==0)
                cout<<"Error! Stack is empty. ";
            else
                cout<<"Error! Invalid stack number given. ";
            cout<<"Please retry.\n";
            delay(7);
            continue;
        }
        cout<<"How many disk do you want to remove: ";
        cin>>chosen_disk;
        if(stacks[chosen_stack]<chosen_disk|| chosen_disk<1)
        {
            cout<<"Error! Invalid disk number. ";
            cout<<"Please retry.\n";
            delay(7);
            continue;
        }
        delay(5);
        //system("CLS");
        stacks[chosen_stack]-=chosen_disk;
        if(stacks[chosen_stack]==0)
            nonempty_stack--;
        if(nonempty_stack==0)
            break;
        player=player==1?2:1;
    }
    cout<<"\nCongratulations! ";
    cout<<(player==1?player1_name:player2_name );
    cout<<" You have won the game.\n\n";
    int p[10]= {0};
    if(player==1)
        p[1]=1;
    else
        p[2]=1;
    addToScoreboard(player1_name,player2_name,p[1],p[2],2);
    system("PAUSE");
    system("CLS");
}


pair<int,int> AI_turn(vector<int>stacks)///computer's turn
{
    int i,sz=stacks.size();
    for(i=1; i<sz; i++)
    {
        if(stacks[i]<3&& stacks[i]>0)
            return make_pair(i,stacks[i]);
    }
    for(i=1; i<sz; i++)
    {
        if(stacks[i]>3)
            return make_pair(i,min(2,stacks[i]-3));
    }
    for(i=1; i<sz; i++)
    {
        if(stacks[i]>0)
            return make_pair(i,1);
    }
}
void VS_AI()///against computer
{
    cout<<"Lets Play!\n";
    srand(time(NULL));
    int total_stack=rand()%10;
    if(total_stack<5)
        total_stack+=5;
    if(total_stack%2==0)
        total_stack++;
    getchar();
    string player_name;
    cout<<"Enter your name: ";
    getline(cin,player_name);
    cout<<endl;
    int turn=0,player=0,nonempty_stack=total_stack,score[10]= {0};
    vector<int>stacks=init_stacks(total_stack);
    player=toss();
    if(player==1)
        cout<<"You go first.\n";
    else
        cout<<"Computer goes first.\n";
    printf("There are %d stacks in total.\n\n",total_stack);

    cout<<"Prepare for the match!\n";
    system("PAUSE");
    while(nonempty_stack)
    {
        cout<<"\n\n";
        system("CLS");
        cout<<"Current score: "<<score[1]<<"  :  "<<score[2]<<endl<<endl;
        cout<<"Stack Number:  ";for(int i=1;i<=total_stack;i++)cout<<i<<"  ";cout<<endl;
        cout<<"Stack State :  ";
        for(int i=1; i<=total_stack; i++)
            printf("%d  ",stacks[i]);
        cout<<endl<<endl;
        int chosen_stack,chosen_disk;

        if(player==1)
        {
            cout<<"Your turn. Which stack do you choose: ";
            cin>>chosen_stack;
            if(chosen_stack>total_stack||chosen_stack<1|| stacks[chosen_stack]==0)
            {
                if(stacks[chosen_stack]==0)
                    cout<<"Error! Stack is empty. ";
                else
                    cout<<"Error! Invalid stack number given. ";
                cout<<"Please retry.\n";
                delay(7);
                continue;
            }
            cout<<"How many disk do you want to remove(1 or 2): ";
            cin>>chosen_disk;
            if(stacks[chosen_stack]<chosen_disk|| chosen_disk>2|| chosen_disk<1)
            {
                if(stacks[chosen_stack]<chosen_disk)
                    cout<<"Error! You can not remove more disk than the stack contains. ";
                else
                    cout<<"Error! Invalid disk number. ";
                cout<<"Please retry.\n";
                delay(7);
                continue;
            }
        }
        else
        {
            cout<<"My turn. ";
            pair<int,int>my_turn=AI_turn(stacks);
            printf("I chose to remove %d disk from stack %d.\n",my_turn.second,my_turn.first);
            chosen_stack=my_turn.first;
            chosen_disk=my_turn.second;
            //delay(7);
            system("PAUSE");

        }
        delay(5);
        stacks[chosen_stack]-=chosen_disk;
        if(stacks[chosen_stack]==0)
            score[player]++,nonempty_stack--;
        if(nonempty_stack==0)
            break;
        player=player==1?2:1;
        delay(3);
    }
    printf("\nFinal score: ");
    cout<<"You ( "<<score[1]<<" )   ";
    cout<<"Me ( "<<score[2]<<" )\n";
    if(score[1]>score[2])
        cout<<"GG,you were lucky! I went easy on you this time!\n\nFun fact: Did you know, Humans made Computer!\n";
    else
        {
            system("Color C0");
            cout<<"HeHe! I'm invincible! :D Why do you even bother trying?\n\n";}
    addToScoreboard(player_name,"AI",score[1],score[2],3);
    system("PAUSE");
    system("Color 0B");
    system("CLS");
}

void special_NIM_bus()
{
    cout<<"Starting Special NimBus\n";
    srand(time(NULL));
    int total_stack=rand()%10;
    if(total_stack<5)
        total_stack+=5;
    if(total_stack%2==0)
        total_stack++;
    getchar();
    cout<<"Remember, you have 1 special turn. Use it wisely!\n\n";
    string player1_name,player2_name;
    cout<<"Enter name of Player1: ";
    getline(cin,player1_name);
    cout<<"Enter name of Player2: ";
    getline(cin,player2_name);
    cout<<endl;
    int turn=0,player=0,nonempty_stack=total_stack,score[10]= {0};
    int flag[11];
    flag[1]=flag[2]=1;
    vector<int>stacks=init_stacks(total_stack);
    player=toss();
    if(player==1)
        cout<<player1_name;
    else
        cout<<player2_name;
    cout<<" goes first.\n";
    printf("There are %d stacks in total.\n\n",total_stack);

    cout<<"Prepare for the match!\n";
    system("PAUSE");
    while(nonempty_stack)
    {
        cout<<"\n\n";
        system("CLS");
        cout<<"Current score: "<<score[1]<<"  :  "<<score[2]<<endl<<endl;
        cout<<"Stack Number:  ";for(int i=1;i<=total_stack;i++)cout<<i<<"  ";cout<<endl;
        cout<<"Stack State :  ";
        for(int i=1; i<=total_stack; i++)
            printf("%d  ",stacks[i]);
        cout<<endl<<endl;
        int chosen_stack,chosen_disk;
        if(player==1)
            cout<<player1_name;
        else
            cout<<player2_name;
        cout<<", which stack do you choose: ";
        cin>>chosen_stack;
        if(chosen_stack>total_stack||chosen_stack<1|| stacks[chosen_stack]==0)
        {
            if(stacks[chosen_stack]==0)
                cout<<"Error! Stack is empty. ";
            else
                cout<<"Error! Invalid stack number given. ";
            cout<<"Please retry.\n";
            delay(7);
            continue;
        }
        cout<<"How many disk do you want to remove: ";
        cin>>chosen_disk;
        if(stacks[chosen_stack]<chosen_disk|| chosen_disk>2|| chosen_disk<1)
        {
            if(stacks[chosen_stack]<chosen_disk)
                cout<<"Error! You can not remove more disk than the stack contains. Please retry.\n";
            else
            {
                if(flag[player]==1)
                {
                    flag[player]=0;
                    stacks[chosen_stack]-=chosen_disk;
                    if(stacks[chosen_stack]==0)
                        score[player]++,nonempty_stack--;
                    if(nonempty_stack==0)
                        break;
                    player=player==1?2:1;
                }
                else
                    cout<<"Error! Invalid disk number.You have only one special move. Please retry.\n";
            }
            delay(7);
            continue;
        }
        delay(5);
        stacks[chosen_stack]-=chosen_disk;
        if(stacks[chosen_stack]==0)
            score[player]++,nonempty_stack--;
        if(nonempty_stack==0)
            break;
        player=player==1?2:1;
    }
    cout<<"\nCongratulations! \n\n";
    cout<<(score[1]>score[2]?player1_name:player2_name );
    cout<<" You have won the game.\n";
    printf("Final score: ");
    cout<<player1_name<<"( "<<score[1]<<" )   ";
    cout<<player2_name<<"( "<<score[2]<<" )\n\n";
    int p1sc=score[1];
    int p2sc=score[2];
    addToScoreboard(player1_name,player2_name,p1sc,p2sc,4);
    system("PAUSE");
    system("CLS");
}


void SCOREBOARD()
{
    system("CLS");
    cout<<"Game Log\n";
    cout<<"\nGAME MODE	DATE	    TIME       PLAYER1 vs PLAYER2   SCORE   WINNER\n\n";
    FILE *myFile;
    FILE *myOpenFile;
    char c;
    if((myOpenFile = fopen("scoreboard.txt", "r")) == NULL)
    {
        cout<<"No game records found.\n";
        FILE *myFile = fopen("scoreboard.txt", "w");
        fclose(myFile);
    }
    while((c=fgetc(myOpenFile))!=EOF)
        putchar(c);
    fclose(myOpenFile);
    cout<<endl;
    system("PAUSE");
    system("CLS");
    //GAME MODE    DATE        TIME       PLAYER1 vs PLAYER2   SCORE   WINNER
}

void print_leaderboard(vector<string>VS)
{
    int i,n;
    VS.pop_back();
    n=VS.size();
    map<string,int>freq;
    vector<pair<int,string> >output;
    vector<string>names;
    n=VS.size();
    for(i=0;i<n;i++)
    {
        if(freq[VS[i] ]==0)names.pb(VS[i]);
        freq[VS[i]]++;
    }
    n=names.size();
    for(i=0;i<n;i++)
    {
        output.pb({freq[names[i]],names[i]});
    }
    sort(output.begin(),output.end());
    reverse(output.begin(),output.end());
    n=min(5,(int)output.size());
    cout<<"RANK WINS PLAYER\n";
    for(i=0;i<n;i++)
    {
        cout<<"  "<<i+1<<"   "<<output[i].first<<"   "<<output[i].second<<endl;
    }
    cout<<endl;
    names.clear();
    freq.clear();
    output.clear();
    system("PAUSE");
}

void LEADERBOARD()
{
    delay(3);
    FILE *myFile;
    FILE *myOpenFile;
    FILE *addLeader;
    char c,cc,s[101];
    vector<string>VS;
    string S;
    upp:;
    system("CLS");
    cout<<"Enter game mode to find leaderboard:\n";
    cout<<"\t1.Regular NIM-Bus\n\t2.Regular NIM\n\t3.AI NIM-Bus\n\t4.Special NIM-bus\n";
    cout<<"\t5.Return to main menu\n";

    cout<<"\nEnter your choice: ";
    int choice;
    cin>>choice;
    delay(5);
    system("CLS");
    if(choice==1)
    {
        if((myOpenFile = fopen("leaderboard_regularNimBus.txt", "r")) == NULL)
        {
            cout<<"No game records found.\n";
            FILE *myFile = fopen("leaderboard_regularNimBus.txt", "w");
            fprintf(myFile,"\n");
            fclose(myFile);
        }
        addLeader=fopen("leaderboard_regularNimBus.txt","r");
        while((cc=fgetc(addLeader))!=EOF)
        {
            fscanf(addLeader,"%s",&s);
            S.clear();
            for(int i=0; i<strlen(s); i++)
                S.pb(s[i]);
            VS.pb(S);
        }
        fclose(addLeader);
        cout<<"Here is top 5 players of Regular NIM-bus:\n\n";
        print_leaderboard(VS);
    }
    else if(choice ==2)
    {
        if((myOpenFile = fopen("leaderboard_Nim.txt", "r")) == NULL)
        {
            cout<<"No game records found.\n";
            FILE *myFile = fopen("leaderboard_Nim.txt", "w");
            fprintf(myFile,"\n");
            fclose(myFile);
        }
        addLeader=fopen("leaderboard_Nim.txt","r");
        while((cc=fgetc(addLeader))!=EOF)
        {
            fscanf(addLeader,"%s",&s);
            S.clear();
            for(int i=0; i<strlen(s); i++)
                S.pb(s[i]);
            VS.pb(S);
        }
        fclose(addLeader);
        cout<<"Here is top 5 players of Traditional NIM:\n\n";
        print_leaderboard(VS);
    }
    else if(choice==3)
    {
        if((myOpenFile = fopen("leaderboard_AINimBus.txt", "r")) == NULL)
        {
            cout<<"No game records found.\n";
            FILE *myFile = fopen("leaderboard_AINimBus.txt", "w");
            fprintf(myFile,"\n");
            fclose(myFile);
        }
        addLeader=fopen("leaderboard_AINimBus.txt","r");
        while((cc=fgetc(addLeader))!=EOF)
        {
            fscanf(addLeader,"%s",&s);
            S.clear();
            for(int i=0; i<strlen(s); i++)
                S.pb(s[i]);
            VS.pb(S);
        }
        fclose(addLeader);
        cout<<"Here is top 5 players of AI NIM-bus:\n\n";
        print_leaderboard(VS);
    }
    else if(choice==4)
    {
        if((myOpenFile = fopen("leaderboard_specialNimBus.txt", "r")) == NULL)
        {
            cout<<"No game records found.\n";
            FILE *myFile = fopen("leaderboard_specialNimBus.txt", "w");
            fprintf(myFile,"\n");
            fclose(myFile);
        }
        addLeader=fopen("leaderboard_specialNimBus.txt","r");
        while((cc=fgetc(addLeader))!=EOF)
        {
            fscanf(addLeader,"%s",&s);
            S.clear();
            for(int i=0; i<strlen(s); i++)
                S.pb(s[i]);
            VS.pb(S);
        }
        fclose(addLeader);
        cout<<"Here is top 5 players of Special NIM-bus:\n\n";
        print_leaderboard(VS);
    }
    else if(choice==5)
        return;
    else
    {
        cout<<"Error in your input.\n\n";
        delay(5);
        goto upp;
    }
    VS.clear();
    system("CLS");
    goto upp;
}

void HELP()
{
    //cout<<"Under construction. :) \n";
    FILE *helpFile;
    char cx;
    fast:;
    cout<<"HELP SECTION\n\n1.Introduction to NIM \n2.HOW TO PLAY Traditional NIM \n3.HOW TO PLAY NIM-BUS \n4.HOW TO PLAY NIM-BUS vs COMPUTER \n5.HOW TO PLAY SPECIAL NIMBUS\n";
    cout<<"6.Return to main menu\n";
    int x;
    cout<<"\nChoose an option: ";
    cin>>x;
    delay(2);
    system("CLS");
    char s[1001];
    if(x==1)
    {
        helpFile=fopen("NIM_INTRO.txt","r");
        while((cx=fgetc(helpFile))!=EOF)
        putchar(cx);
        fclose(helpFile);
    }
    else if(x==2)
    {
        helpFile=fopen("REGULAR_NIM.txt","r");
        while((cx=fgetc(helpFile))!=EOF)
        putchar(cx);
        fclose(helpFile);
    }
    else if(x==3)
    {
        helpFile=fopen("2P_NIMBUS.txt","r");
        while((cx=fgetc(helpFile))!=EOF){
        fgets(s,1000,helpFile);
        puts(s);
        }
        fclose(helpFile);
    }
    else if(x==4)
    {
        helpFile=fopen("NIMBUS_AI.txt","r");
        while((cx=fgetc(helpFile))!=EOF)
        putchar(cx);
        fclose(helpFile);
    }
    else if(x==5)
    {
        helpFile=fopen("SPECIAL_NIMBUS.txt","r");
        while((cx=fgetc(helpFile))!=EOF)
        putchar(cx);
        fclose(helpFile);
    }
    /*else if(x==6)
    {
        helpFile=fopen("MULTI_NIMBUS.txt","r");
        while((cx=fgetc(helpFile))!=EOF)
        putchar(cx);
        fclose(helpFile);
    }*/
    else if(x==6)goto last;
    else cout<<"ERROR";

    cout<<"\n";
    system("PAUSE");
    system("CLS");
    goto fast;
    last:;
}

void CREDITS()
{
    system("CLS");
    cout<<"Project NIM-bus\n\n";
    cout<<"Rahman Aashnan 190041204\n";
    cout<<"Aziz Syem      190041238\n";
    cout<<"Hasan Moudud   190041240\n\n\n";
    system("PAUSE");
    system("CLS");
}

int main()
{
    system("Color B0");
    int choice;
    cout<<"Welcome to NIM-bus\n\n";
    system("PAUSE");

begining:
    ;
    system("CLS");
    system("Color 0B");

    cout<<"Select what you want to do:\n\n";
    cout<<"1.Start a new game.\n";
    cout<<"2.Visit Leaderboard.\n";
    cout<<"3.Help section.\n";
    cout<<"4.Credits.\n";
    cout<<"5.Quit.\n\n";
    cout<<"Enter your choice: ";
    cin>>choice;
    cout<<"\n";
    delay(2);
    system("CLS");

    if(choice==1)
    {
        cout<<"Game Mode: \n";
        cout<<"\t1.NIM-bus.\n";
        cout<<"\t2.NIM.\n";
        cout<<"\t3.Return to main menu.\n";
        cout<<"\nEnter your choice: ";
        cin>>choice;
        cout<<endl;
        delay(2);
        system("CLS");
        if(choice==1)
        {
            cout<<"NIM-bus:\n\t1.Regular(2 player).\n\t2.VS Computer.\n\t3.Special.";
            cout<<"\n\t4.Return to main menu.\n";
            cout<<"\nEnter your choice: ";
            cin>>choice;
            cout<<endl;
            delay(2);
            system("CLS");
            if(choice==1)
                NIM_bus();
            else if(choice==2)
                VS_AI();
            else if(choice==3)
            {
                special_NIM_bus();
            }
            else if(choice==4)goto begining;
            else
            {
                cout<<"Error in your input.\n\n";
                delay(5);
                system("CLS");
                goto begining;
            }
        }
        else if(choice==2)
        {
            NIM();
        }
        else if(choice==3)goto begining;
        else
        {
            cout<<"Error in your input.\n\n";
            delay(5);
            system("CLS");
            goto begining;
        }
    }
    else if(choice==2)
    {
        cout<<"\t1.Game log.\n";
        cout<<"\t2.Leaderboard.\n";
        cout<<"\t3.Return to main menu.\n";
        cout<<"\nEnter your choice: ";
        cin>>choice;
        if(choice==1)
            SCOREBOARD();
        else if(choice==2)
        {
            LEADERBOARD();
            system("CLS");
        }
        else if(choice==3)goto begining;
        else
        {
            cout<<"Error in your input.\n\n";
            delay(5);
            system("CLS");
            goto begining;
        }
    }
    else if(choice==3)
        HELP();
    else if(choice==4)
        CREDITS();
    else if(choice==5)
        goto last;
    else
    {
        cout<<"Error in your input.Do you wish to continue?(Y/N): ";
        char choice1[10];
        scanf("%s",choice1);
        cout<<"\n";
        delay(4);
        system("CLS");

        if(choice1[0]=='y'|| choice1[0]=='Y')
            goto begining;
last:
        ;
        cout<<"Thanks for your time. See you later. Turning NIM-bus OFF.\n";
        system("PAUSE");
        return 0;
    }
    goto begining;
    system("PAUSE");
    return 0;
}
