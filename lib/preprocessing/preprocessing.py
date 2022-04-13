import json
from operator import index
from turtle import right
from typing import Counter
import pandas as pd
from IPython.display import display
import numpy as np

input = pd.read_csv('../../data/ogd6_kev-bezueger.csv')
map = json.load(open("../../node_modules/swiss-maps/2021-07/ch-combined.json"))

result_country = input.groupby(['Jahr']).agg(
    max_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=max),
    avg_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=np.mean),
    min_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=min),
    std_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=np.std),
    max_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=max),
    avg_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=np.mean),
    min_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=min),
    std_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=np.std),
    max_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=max),
    avg_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=np.mean),
    min_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=min),
    std_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=np.std),
    count_power_type = pd.NamedAgg(column = "Anlage_energietraeger", aggfunc= Counter),
    count_infra_type = pd.NamedAgg(column = "Anlagentyp", aggfunc= Counter),
    count_projekt_type = pd.NamedAgg(column = "Anlage_projekt-bezeichnung", aggfunc= Counter)
)

result_canton = input.groupby(['Jahr','Anlage_kanton']).agg(
    max_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=max),
    avg_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=np.mean),
    min_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=min),
    std_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=np.std),
    max_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=max),
    avg_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=np.mean),
    min_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=min),
    std_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=np.std),
    max_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=max),
    avg_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=np.mean),
    min_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=min),
    std_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=np.std),
    count_power_type = pd.NamedAgg(column = "Anlage_energietraeger", aggfunc= Counter),
    count_infra_type = pd.NamedAgg(column = "Anlagentyp", aggfunc= Counter),
    count_projekt_type = pd.NamedAgg(column = "Anlage_projekt-bezeichnung", aggfunc= Counter)
)


result_municipalities = input.groupby(['Jahr','Anlage_ort']).agg(
    max_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=max),
    avg_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=np.mean),
    min_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=min),
    std_power_kw = pd.NamedAgg(column = "Leistung_kw", aggfunc=np.std),
    max_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=max),
    avg_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=np.mean),
    min_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=min),
    std_power_kwh = pd.NamedAgg(column = "Produktion_kwh", aggfunc=np.std),
    max_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=max),
    avg_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=np.mean),
    min_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=min),
    std_compensation = pd.NamedAgg(column = "Verguetung_chf", aggfunc=np.std),
    count_power_type = pd.NamedAgg(column = "Anlage_energietraeger", aggfunc= Counter),
    count_infra_type = pd.NamedAgg(column = "Anlagentyp", aggfunc= Counter),
    count_projekt_type = pd.NamedAgg(column = "Anlage_projekt-bezeichnung", aggfunc= Counter)
)

dfs = [result_country,result_canton,result_municipalities]

combined_dfs = pd.DataFrame(dfs, index=['country','canton', 'municipalities'])
combined_dfs.to_json('combined_results.json')
