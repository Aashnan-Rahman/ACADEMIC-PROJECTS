<?php
include("includes/fusioncharts.php");

$columnChart = new FusionCharts("column2d", "ex1", "100%", 400, "chart-1", "json", '{
  "chart": {
    "caption": "Countries With Most Oil Reserves [2017-18]",
    "subcaption": "In MMbbl = One Million barrels",
    "xaxisname": "Country",
    "yaxisname": "Reserves (MMbbl)",
    "numbersuffix": "K",
    "theme": "umber"
  },
  "data": [
    {
      "label": "Venezuela",
      "value": "290"
    },
    {
      "label": "Saudi",
      "value": "260"
    },
    {
      "label": "Canada",
      "value": "180"
    },
    {
      "label": "Iran",
      "value": "140"
    },
    {
      "label": "Russia",
      "value": "115"
    },
    {
      "label": "UAE",
      "value": "100"
    },
    {
      "label": "US",
      "value": "30"
    },
    {
      "label": "China",
      "value": "30"
    }
  ]
}');

$columnChart->render();
?>