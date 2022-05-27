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
transformation = pd.read_csv('../../data/transformation.csv', encoding="utf-8")
municipalities = pd.read_csv("../../node_modules/swiss-maps/2021-07/municipalitiesV3.csv", encoding="ISO-8859-1")

def MergeFunctionCountry(df, data , year, attribute):
    df[attribute] = [data.loc[year][attribute].tolist()]
    df = df.rename(columns= {str(attribute): str(attribute) + str(year)})
    return df

def MergeFunctionCanton(df, data , year, attribute, mergecriteria):
    newdf = pd.DataFrame(data.loc[year][attribute].apply(list, axis=1), columns = [attribute])
    df = df.merge(newdf, on=[mergecriteria])
    df = df.rename(columns= {str(attribute): str(attribute) + str(year)})
    return df

def MergeFunctionMunicipalities(df, data , year, attribute):
    newdf = pd.DataFrame(data.loc[year][attribute].apply(list, axis=1), columns = [attribute])
    df[attribute] = newdf
    df = df.rename(columns= {str(attribute): str(attribute) + str(year)})
    return df

input = input.rename(columns={'Jahr':'year', 'Anlage_kanton':"abbreviation", 'Anlage_ort':"municipality", 'Anlage_plz':'PLZ4'})
input["Anlage_energietraeger"].replace('', 'Not available', inplace=True)
input["Anlage_energietraeger"].replace(np.nan, 'Not available', inplace=True)
input["Anlage_energietraeger"].replace('Photovoltaik', 'Photovoltaic', inplace=True)
input["Anlage_energietraeger"].replace('Wasserkraft', 'Hydropower', inplace=True)
input["Anlage_energietraeger"].replace('Biomasse', 'Biomass', inplace=True)

input["Anlagentyp"].replace('', 'Not available', inplace=True)
input["Anlagentyp"].replace(np.nan, 'Not available', inplace=True)
input["Anlagentyp"].replace('Angebaute Anlage', 'Attached photovoltaic plant', inplace=True)
input["Anlagentyp"].replace('Integrierte Anlage', 'Integrated photovoltaic plant', inplace=True)
input["Anlagentyp"].replace('Trinkwasserkraftwerk', 'Drinking water hydropower plant', inplace=True)
input["Anlagentyp"].replace('Durchlaufkraftwerk', 'Flow hydropower plant', inplace=True)
input["Anlagentyp"].replace('WKK-Prozess', 'CHP power plant', inplace=True)
input["Anlagentyp"].replace('Ausleitkraftwerk', 'Diversion hydropower plant', inplace=True)
input["Anlagentyp"].replace('Klärgasanlage', 'Sewage gas power plant', inplace=True)
input["Anlagentyp"].replace('Freistehende Anlage', 'Detached photovoltaic plant', inplace=True)
input["Anlagentyp"].replace('Windenergieanlage', 'Wind turbine', inplace=True)
input["Anlagentyp"].replace('Dotierwasserkraftwerk', 'Doping hydropower plant', inplace=True)
input["Anlagentyp"].replace('Biomassenutzung', 'Biomass utilization plant', inplace=True)
input["Anlagentyp"].replace('Dampfprozess', 'Steam hydropower plant', inplace=True)
input["Anlagentyp"].replace('Abwasserkraftwerk', 'Wastewater power plant', inplace=True)
input["Anlagentyp"].replace('Kehrichtverbrennungsanlage', 'Waste incineration plant', inplace=True)
input["Anlagentyp"].replace('nicht bekannt', 'Not available', inplace=True)
input["Anlagentyp"].replace('Abwasserreinigung', 'Wastewater power plant', inplace=True)
input["Anlagentyp"].replace('Deponiegasanlage', 'Landfill gas plant', inplace=True)
input["Anlagentyp"].replace('Schlammverbrennungsanlage', 'CHP power plant', inplace=True)
input["Anlagentyp"].replace('Kehrichtverbrennung', 'Waste incineration plant', inplace=True)

inputV2 = input.merge(transformation, left_on='PLZ4', right_on='PLZ4', how='left')

inputV2["GDENR"] = inputV2["GDENR"].fillna(7000).astype(int)

result_country = input.groupby(['year']).agg({
    'Leistung_kw':['max','min',np.mean,np.std, "count", "sum"],
    'Produktion_kwh': ['max','min',np.mean,np.std,"count", "sum"],
    'Verguetung_chf': ['max','min',np.mean,np.std,"count", "sum"],
    'Anlage_energietraeger': Counter,
    'Anlagentyp': Counter,
    'Anlage_projekt-bezeichnung': Counter,
    })

result_country["Anlage_energietraeger"] = result_country["Anlage_energietraeger"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))
result_country["Anlagentyp"] = result_country["Anlagentyp"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))
result_country["Anlage_projekt-bezeichnung"] = result_country["Anlage_projekt-bezeichnung"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))


result_canton = input.groupby(['year','abbreviation']).agg({
    'Leistung_kw':['max','min',np.mean,np.std, "count", "sum"],
    'Produktion_kwh': ['max','min',np.mean,np.std,"count", "sum"],
    'Verguetung_chf': ['max','min',np.mean,np.std,"count", "sum"],
    'Anlage_energietraeger': Counter,
    'Anlagentyp': Counter,
    'Anlage_projekt-bezeichnung': Counter,
    })

result_canton["Anlage_energietraeger"] = result_canton["Anlage_energietraeger"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))
result_canton["Anlagentyp"] = result_canton["Anlagentyp"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))
result_canton["Anlage_projekt-bezeichnung"] = result_canton["Anlage_projekt-bezeichnung"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))

result_municipalities = inputV2.groupby(['year','GDENR']).agg({
    'Leistung_kw':['max','min',np.mean, np.std, "count", "sum"],
    'Produktion_kwh': ['max','min',np.mean, np.std,"count", "sum"],
    'Verguetung_chf': ['max','min',np.mean, np.std,"count", "sum"],
    'Anlage_energietraeger': Counter,
    'Anlagentyp': Counter,
    'Anlage_projekt-bezeichnung': Counter
    })

result_municipalities["Anlage_energietraeger"] = result_municipalities["Anlage_energietraeger"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))
result_municipalities["Anlagentyp"] = result_municipalities["Anlagentyp"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))
result_municipalities["Anlage_projekt-bezeichnung"] = result_municipalities["Anlage_projekt-bezeichnung"]["_SpecialGenericAlias"].transform(lambda x: dict(x.most_common()))
result_municipalities["Leistung_kw"] = result_municipalities["Leistung_kw"].fillna(0)
result_municipalities["Produktion_kwh"] = result_municipalities["Produktion_kwh"].fillna(0)
result_municipalities["Verguetung_chf"] = result_municipalities["Verguetung_chf"].fillna(0)

country = pd.DataFrame({'name': ['Switzerland'], 'abbreviation':['CH']})
for y in range(2011,2022):
    country = MergeFunctionCountry(country, result_country , y, "Leistung_kw")
    country = MergeFunctionCountry(country, result_country , y, "Produktion_kwh")
    country = MergeFunctionCountry(country, result_country , y, "Verguetung_chf")
    country = MergeFunctionCountry(country, result_country , y, "Anlage_energietraeger")
    country = MergeFunctionCountry(country, result_country , y, "Anlagentyp")
    country = MergeFunctionCountry(country, result_country , y, "Anlage_projekt-bezeichnung")

for x in range(2011,2022):
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Leistung_kw", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Produktion_kwh", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Verguetung_chf", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Anlage_energietraeger", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Anlagentyp", "abbreviation")
    cantons = MergeFunctionCanton(cantons, result_canton , x, "Anlage_projekt-bezeichnung", "abbreviation")

# display(cantons)

municipalities = pd.DataFrame({})
for y in range(2011,2022):
    municipalities = MergeFunctionMunicipalities(municipalities, result_municipalities , y, "Leistung_kw")
    municipalities = MergeFunctionMunicipalities(municipalities, result_municipalities , y, "Produktion_kwh")
    municipalities = MergeFunctionMunicipalities(municipalities, result_municipalities , y, "Verguetung_chf")
    municipalities = MergeFunctionMunicipalities(municipalities, result_municipalities , y, "Anlage_energietraeger")
    municipalities = MergeFunctionMunicipalities(municipalities, result_municipalities , y, "Anlagentyp")
    municipalities = MergeFunctionMunicipalities(municipalities, result_municipalities , y, "Anlage_projekt-bezeichnung")


# cantons.to_csv('cantonscombined.csv')

# country.to_csv('countrycombined.csv')

cantons.to_json('cantonscombined.json')

country.to_json('countrycombined.json')

municipalities.to_json('municipalities.json')


# combined_dfs = pd.DataFrame(dfs, index=['country','canton', 'municipalities'])
# combined_dfs.to_json('combined_results.json')
