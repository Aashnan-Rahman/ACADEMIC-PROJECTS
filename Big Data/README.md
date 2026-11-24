# Girvan–Newman Community Detection

The notebook implements Girvan–Newman community detection for undirected, unweighted graphs. It computes edge betweenness with breadth-first search, removes the highest-scoring edge, and recalculates scores after every removal. The final cell checks each community partition against NetworkX's `girvan_newman` using the same rule to break ties.

## Run the notebook

Open [the assignment notebook](./Girvan_Newman_Assignment_%28Aashnan_231041006%29.ipynb) in Jupyter with [graph.txt](./graph.txt) beside it, then run all cells. In Colab, run all cells and upload the bundled file when prompted.

For a local Python environment, install the notebook dependencies with `python -m pip install jupyter networkx pandas numpy matplotlib pillow`.

The sample has seven nodes and nine edges. Its first split removes edge `1–3` and separates `{0, 1, 2}` from `{3, 4, 5, 6}`. All six sample partitions match NetworkX. To try a different graph, put the node count on the first line and the edge list on the next line. Use integer node labels starting at zero.

## Interactive explorer

Open [index.html](./index.html) in a browser. Play the removals, scrub to any step, or jump to the next split. The graph and step details show the current communities and the scores used to select the next edge. Paste an edge list or open a text file to use your own graph. Files are processed in the browser.

The explorer is a static Vercel project. Set the Vercel Root Directory to `Big Data` when importing the repository, or run `npx vercel deploy --prod --cwd "Big Data"` from the repository root after signing in. [Vercel CLI deployment guide](https://vercel.com/docs/cli/deploy)
