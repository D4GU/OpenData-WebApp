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

def MergeFunctionCountry(df, data , year, attribute):
    df[attribute] = [data.loc[year][attribute].tolist()]
    df = df.rename(columns= {str(attribute): str(attribute) + str(year)})
    return df

def MergeFunctionCanton(df, data , year, attribute, mergecriteria):
    newdf = pd.DataFrame(data.loc[year][attribute].apply(list, axis=1), columns = [attribute])
    df = df.merge(newdf, on=[mergecriteria])
    df = df.rename(columns= {str(attribute): str(attribute) + str(year)})
    return df

input = input.rename(columns={'Jahr':'year', 'Anlage_kanton':"abbreviation", 'Anlage_ort':"municipality"})

result_country = input.groupby(['year']).agg({
    'Leistung_kw':['max','min',np.mean,np.std, "count", "sum"],
    'Produktion_kwh': ['max','min',np.mean,np.std, "sum"],
    'Verguetung_chf': ['max','min',np.mean,np.std, "sum"],
    'Anlage_energietraeger': Counter,
    'Anlagentyp': Counter,
    'Anlage_projekt-bezeichnung': Counter,
    })

result_country["Anlage_energietraeger"] = result_country["Anlage_energietraeger"]["_SpecialGenericAlias"].transform(lambda x: dict(x))
result_country["Anlagentyp"] = result_country["Anlagentyp"]["_SpecialGenericAlias"].transform(lambda x: dict(x))
result_country["Anlage_projekt-bezeichnung"] = result_country["Anlage_projekt-bezeichnung"]["_SpecialGenericAlias"].transform(lambda x: dict(x))


result_canton = input.groupby(['year','abbreviation']).agg({
    'Leistung_kw':['max','min',np.mean,np.std, "count", "sum"],
    'Produktion_kwh': ['max','min',np.mean,np.std, "sum"],
    'Verguetung_chf': ['max','min',np.mean,np.std, "sum"],
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
    'Anlage_projekt-bezeichnung': Counter
    })

for x in range(2011,2022):
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Leistung_kw", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Produktion_kwh", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Verguetung_chf", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Anlage_energietraeger", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Anlagentyp", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Anlage_projekt-bezeichnung", "abbreviation")

# display(cantons)

country = pd.DataFrame({'name': ['Switzerland'], 'abbreviation':['CH']})
for y in range(2011,2022):
    country = MergeFunctionCountry(country, result_country , y, "Leistung_kw")
    country = MergeFunctionCountry(country, result_country , y, "Produktion_kwh")
    country = MergeFunctionCountry(country, result_country , y, "Verguetung_chf")
    country = MergeFunctionCountry(country, result_country , y, "Anlage_energietraeger")
    country = MergeFunctionCountry(country, result_country , y, "Anlagentyp")
    country = MergeFunctionCountry(country, result_country , y, "Anlage_projekt-bezeichnung")


# cantons.to_csv('cantonscombined.csv')

# country.to_csv('countrycombined.csv')



# combined_dfs = pd.DataFrame(dfs, index=['country','canton', 'municipalities'])
# combined_dfs.to_json('combined_results.json')
