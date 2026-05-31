# ==============================================================================
# MASTER OFFERTSNURRA PRO (V5.1) - STENSJÖ VÅRD AB (SEPTEMBER 2026)
# KÄLLKOD FÖR VERIFIERING AV EKONOMI, LÖNEVÄXLING OCH BUDGETOPTIMERING
# ==============================================================================

def berakna_offert_v5_1(timmar_dag, timmar_kvall, h_vn, h_hn, sjuktimmar, intakt_per_timme):
    """
    Räknar ut skarp offert, marginaler och löneväxlingsutrymme för september 2026.
    Inkluderar proportionell sjuklön och aktiverade nattpass (h_vn, h_hn).
    """
    # 1. GRUNDLÄGGANDE PARAMETRAR (FASTSTÄLLDA FÖR NINAS AVTAL 2026)
    GRUNDLON_PER_TIMME = 411.0       # Inklusive semesterersättning
    ARBETSGIVARAVGIFT_RATE = 0.3142  # Standard 31.42% för 2026
    PENSIONS_SPARR_2026 = 56087.0    # Statlig gräns för allmän pension/sjukpenning
    VINSTMAL_MARGINAL = 0.180        # Fastlåst mål på 18.0% i TB
    
    # RESETRICKET: Milersättning (5.23 mil enkel -> 10.46 mil ToR * 20 pass = 209.2 mil)
    # 209.2 mil * 25 kr/milen = 5 230 kr. Matas in som en ren utgift (Kostnad boende/Stensjö-utgift)
    KOSTNAD_RESETRES_BOENDE = 5230.0 

    # 2. BUGGFIX: PROPORTIONELL SJUKLÖNEFÖRDELNING
    # Räknar ut totalt planerade timmar för att fördela frånvaron rättvist över schemat
    totalt_planerade_timmar = timmar_dag + timmar_kvall + h_vn + h_hn
    if totalt_planerade_timmar > 0:
        sjuk_kvot = sjuktimmar / totalt_planerade_timmar
        # Reducera timmarna proportionellt så att inga timmar "hänger i luften"
        timmar_dag_faktisk = timmar_dag * (1 - sjuk_kvot)
        timmar_kvall_faktisk = timmar_kvall * (1 - sjuk_kvot)
        h_vn_faktisk = h_vn * (1 - sjuk_kvot)
        h_hn_faktisk = h_hn * (1 - sjuk_kvot)
    else:
        timmar_dag_faktisk = timmar_kvall_faktisk = h_vn_faktisk = h_hn_faktisk = 0

    totalt_arbetade_timmar = timmar_dag_faktisk + timmar_kvall_faktisk + h_vn_faktisk + h_hn_faktisk

    # 3. INTÄKTSBERÄKNING (Skarpa timmar mot kund)
    total_intakt = totalt_arbetade_timmar * intakt_per_timme

    # 4. LÖNE- OCH UTGIFTSBERÄKNING
    # Bruttolön före eventuell löneväxling
    total_bruttolon_fore_vaxling = totalt_arbetade_timmar * GRUNDLON_PER_TIMME
    
    # Arbetsgivaravgifter på bruttolönen
    arbetsgivaravgifter = total_bruttolon_fore_vaxling * ARBETSGIVARAVGIFT_RATE
    
    # Total kostnad för bolaget (inklusive Resetricket inlagt som ren utgift)
    total_utgift_bolag = total_bruttolon_fore_vaxling + arbetsgivaravgifter + KOSTNAD_RESETRES_BOENDE

    # 5. MARGINALBERÄKNING (Täckningsbidrag / TB)
    faktisk_marginal_tb = (total_intakt - total_utgift_bolag) / total_intakt if total_intakt > 0 else 0

    # 6. LÖNEVÄXLINGSLOGIK MED 2026 ÅRS SPÄRRAR
    # Den skattepliktiga lönen får aldrig sjunka under pensionsspärren
    if total_bruttolon_fore_vaxling > PENSIONS_SPARR_2026:
        max_lonevaxling_avdrag = total_bruttolon_fore_vaxling - PENSIONS_SPARR_2026
        # Bolagets sparade arbetsgivaravgifter (+6% företagsbonus skjuts till pensionen)
        sparad_aga_till_pension = max_lonevaxling_avdrag * 0.06
        total_pensionsavsattning = max_lonevaxling_avdrag + sparad_aga_till_pension
        skattepliktig_bruttolon_efter_vaxling = PENSIONS_SPARR_2026
    else:
        max_lonevaxling_avdrag = 0.0
        sparad_aga_till_pension = 0.0
        total_pensionsavsattning = 0.0
        skattepliktig_bruttolon_efter_vaxling = total_bruttolon_fore_vaxling

    # 7. SAMMANSTÄLLNING AV RESULTAT
    return {
        "ekonomi": {
            "total_intakt_kr": round(total_intakt, 2),
            "total_utgift_bolag_kr": round(total_utgift_bolag, 2),
            "faktisk_marginal_tb_procent": round(faktisk_marginal_tb * 100, 2),
            "vinstmal_uppfyllt": faktisk_marginal_tb >= VINSTMAL_MARGINAL
        },
        "lonevaxling_live_panel": {
            "bruttolon_fore_vaxling_kr": round(total_bruttolon_fore_vaxling, 2),
            "skattepliktig_lon_efter_vaxling_kr": round(skattepliktig_bruttolon_efter_vaxling, 2),
            "max_avdrag_lonevaxling_kr": round(max_lonevaxling_avdrag, 2),
            "foretagsbonus_pension_kr": round(sparad_aga_till_pension, 2),
            "total_extra_pensionsavsattning_kr": round(total_pensionsavsattning, 2),
            "pensionssparr_skyddad": skattepliktig_bruttolon_efter_vaxling >= PENSIONS_SPARR_2026
        },
        "timstatistisk_verifiering": {
            "arbetade_timmar_efter_sjukavdrag": round(totalt_arbetade_timmar, 2),
            "h_vn_aktiverad": h_vn_faktisk > 0,
            "h_hn_aktiverad": h_hn_faktisk > 0
        }
    }

# ==============================================================================
# EXEMPELKÖRNING FÖR NINAS SCHEMA (Verifiering av live-data)
# ==============================================================================
if __name__ == "__main__":
    # Testdata: 100 dag, 40 kväll, 20 natt vardag (h_vn), 10 natt helg (h_hn), 10 sjuktimmar.
    # Antaget kundpris: 780 kr/h för att testa marginalen.
    resultat = berakna_offert_v5_1(
        timmar_dag=100, 
        timmar_kvall=40, 
        h_vn=20, 
        h_hn=10, 
        sjuktimmar=10, 
        intakt_per_timme=780
    )
    print(f"Faktisk Marginal TB: {resultat['ekonomi']['faktisk_marginal_tb_procent']}%")
    print(f"Max Löneväxling: {resultat['lonevaxling_live_panel']['max_avdrag_lonevaxling_kr']} kr")
