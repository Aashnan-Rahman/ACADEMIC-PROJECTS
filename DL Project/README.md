# Fighting-Game Reinforcement Learning

This research project studies what reinforcement-learning agents learn under different training paradigms in a competitive fighting-game environment. It includes single-agent training, curriculum learning, IPPO/2-timescale experiments, league training, PSRO, FSP, and mutual-information probing.

## Built with

- Python 3.8 on Linux
- Gym Retro
- Stable Baselines
- NumPy, PyTorch, TensorFlow, and experiment utilities listed in `environment.yml`

## Setup

```bash
conda env create -f environment.yml
conda activate lifight
```

A legally acquired Street Fighter II ROM must be placed in Gym Retro's game directory. ROM files are not provided by this repository.

## Main scripts

| Script | Purpose |
| --- | --- |
| `train.py` | Train against the built-in CPU player |
| `finetune.py` | Curriculum learning and fine-tuning |
| `ippo.py` | IPPO and 2-timescale training |
| `train_ma.py` | League, PSRO, and FSP experiments |
| `best_response.py` | Train a single-agent exploiter |
| `play_with_ai.py` | Play against a trained policy |

The environment wrappers live in `main/common/retro_wrappers.py`; algorithm and league implementations are in `main/common/algorithms.py` and `main/common/league.py`. Training paths and experiment flags should be adjusted for the local machine before running.

## Reference

This codebase is based on the FightLadder benchmark described in *FightLadder: A Benchmark for Competitive Multi-Agent Reinforcement Learning* (ICML 2024). See `LICENSE` for the repository licence.
