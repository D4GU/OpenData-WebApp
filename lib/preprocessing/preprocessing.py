from itertools import count
import json
from operator import index
from turtle import right
from typing import Counter
import pandas as pd
from IPython.display import display
import numpy as np

input = pd.read_csv('../../data/ogd6_kev-bezueger.csv')
map = json.load(open("../../node_modules/swiss-maps/2021-07/ch-combined.json"))
cantons = pd.read_csv("../../node_modules/swiss-maps/2021-07/cantonsV3.csv")
municipalities = pd.read_csv("../../node_modules/swiss-maps/2021-07/municipalitiesV3.csv")

input = input.rename(columns={'Jahr':'year', 'Anlage_kanton':"abbreviation", 'Anlage_ort':"municipality"})


result_country = input.groupby(['year']).agg({
    'Leistung_kw':['max','min',np.mean,np.std, "count"],
    'Produktion_kwh': ['max','min',np.mean,np.std],
    'Verguetung_chf': ['max','min',np.mean,np.std],
    'Anlage_energietraeger': Counter,
    'Anlagentyp': Counter,
    'Anlage_projekt-bezeichnung': Counter,
    })

result_canton = input.groupby(['year','abbreviation']).agg({
    'Leistung_kw':['max','min',np.mean,np.std, "count"],
    'Produktion_kwh': ['max','min',np.mean,np.std],
    'Verguetung_chf': ['max','min',np.mean,np.std],
    'Anlage_energietraeger': Counter,
    'Anlagentyp': Counter,
    'Anlage_projekt-bezeichnung': Counter,
    })

result_canton["Anlage_energietraeger"] = result_canton["Anlage_energietraeger"]["_SpecialGenericAlias"].transform(lambda x: dict(x))
result_canton["Anlagentyp"] = result_canton["Anlagentyp"]["_SpecialGenericAlias"].transform(lambda x: dict(x))
result_canton["Anlage_projekt-bezeichnung"] = result_canton["Anlage_projekt-bezeichnung"]["_SpecialGenericAlias"].transform(lambda x: dict(x))

result_municipalities = input.groupby(['year','municipality']).agg({
    'Leistung_kw':['max','min',np.mean,np.std, "count"],
    'Produktion_kwh': ['max','min',np.mean,np.std],
    'Verguetung_chf': ['max','min',np.mean,np.std],
    'Anlage_energietraeger': Counter,
    'Anlagentyp': Counter,
    'Anlage_projekt-bezeichnung': Counter,
    })


def MergeFunction(cantons, data , year, attribute):
    newdf = pd.DataFrame(data.loc[year][attribute].apply(list, axis=1), columns = [attribute])
    cantons = cantons.merge(newdf, on=["abbreviation"])
    cantons = cantons.rename(columns= {str(attribute): str(year) + "_" + str(attribute)})
    return cantons



display(result_canton.loc[2011]["Anlage_projekt-bezeichnung"]["_SpecialGenericAlias"]["AG"])

# display(result_canton.loc[2011]["Leistung_kw"].apply(list, axis=1))

# for x in range(2011,2021):
#     cantons = MergeFunction(cantons, result_canton , x, "Leistung_kw")
#     cantons = MergeFunction(cantons, result_canton , x, "Produktion_kwh")
#     cantons = MergeFunction(cantons, result_canton , x, "Verguetung_chf")
#     cantons = MergeFunction(cantons, result_canton , x, "Anlage_energietraeger")
#     cantons = MergeFunction(cantons, result_canton , x, "Anlagentyp")
#     cantons = MergeFunction(cantons, result_canton , x, "Anlage_projekt-bezeichnung")


# display(cantons)
# display(cantons)

# display(result_canton)


# result_canton.set_index
# # print(municipalities)
# for row in cantons:
#     print(row)

# for x in range(2011,2021):
#     cantons = MergeFunction(cantons, result_canton, x, "max_power_kw")

# display(MergeFunction(cantons, result_canton, 2011, "max_power_kw"))
# for x in range(2011,2021):



# display(result_canton.loc[2011]["max_power_kw"])

# dfs = [result_country,result_canton,result_municipalities]

# combined_dfs = pd.DataFrame(dfs, index=['country','canton', 'municipalities'])
# combined_dfs.to_json('combined_results.json')
