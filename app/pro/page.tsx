<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Stensjö Vård - Offert & Kalkylator V4</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f1f5f9; color: #1e293b; margin: 0; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        h1 { color: #0f172a; margin-top: 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; }
        .section { background: #f8fafc; padding: 20px; border-radius: 6px; border: 1px solid #e2e8f0; }
        h2 { font-size: 16px; margin-top: 0; color: #1e293b; border-left: 4px solid #16a34a; padding-left: 8px; }
        .form-group { margin-bottom: 15px; }
        label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 5px; color: #475569; }
        input[type="number"] { width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 4px; box-sizing: border-box; }
        .checkbox-group { display: flex; align-items: center; gap: 10px; margin-top: 15px; }
        .btn-print { background-color: #1e3a8a; color: white; padding: 12px 20px; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; width: 100%; font-size: 16px; margin-bottom: 20px; }
        .btn-print:hover { background-color: #172554; }
        
        /* Resultattabell */
        .res-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .res-table td { padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
        .res-table tr.total { font-weight: bold; background: #f1f5f9; }
        .tb-box { background: #1e293b; color: white; padding: 20px; border-radius: 6px; margin-top: 20px; text-align: center; }
        .tb-box h3 { margin: 0; font-size: 14px; color: #94a3b8; }
        .tb-box .val { font-size: 28px; font-weight: bold; margin: 5px 0; color: #34d399; }
        
        /* Print-styling för PDF */
        @media print {
            body { background: white; padding: 0; }
            .container { box-shadow: none; padding: 0; max-width: 100%; }
            .grid { grid-template-columns: 1fr; }
            .inputs-side, .btn-print { display: none; }
            .section { border: none; background: white; padding: 0; }
            .tb-box { background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }
            .tb-box .val { color: #16a34a; }
        }
    </style>
</head>
<body>

<div class="container">
    <h1>Stensjö Vård AB — Offertverktyg</h1>
    
    <div class="grid">
        <div class="inputs-side">
            <button class="btn-print" onclick="window.print()">🖨️ Exportera & Skriv ut till PDF</button>
            
            <div class="section">
                <h2>1. Intäkt från Region (SKR)</h2>
                <div class="form-group">
                    <label>Timpris till kund (kr/h)</label>
                    <input type="number" id="kundpris" value="770" oninput="calculate()">
                </div>
                <div class="form-group">
                    <label>Totala arbetade timmar i månaden</label>
                    <input type="number" id="timmar" value="172" oninput="calculate()">
                </div>
            </div>
            
            <div class="section" style="margin-top: 20px;">
                <h2>2. Konsultlön & Löneväxling</h2>
                <div class="form-group">
                    <label>Grundtimlön till konsult (kr/h, inkl. semesterers.)</label>
                    <input type="number" id="konsultlon" value="470" oninput="calculate()">
                </div>
                <div class="form-group">
                    <label>Avdrag för Löneväxling (kr/månad)</label>
                    <input type="number" id="lonevaxling" value="10000" oninput="calculate()">
                </div>
            </div>

            <div class="section" style="margin-top: 20px;">
                <h2>3. Resor & SITHS-kort (Rena utgifter)</h2>
                <div class="form-group">
                    <label>Antal körda mil totalt</label>
                    <input type="number" id="mil" value="220" oninput="calculate()">
                </div>
                <div class="form-group">
                    <label>Ersättning per mil (kr/mil)</label>
                    <input type="number" id="krmil" value="18" oninput="calculate()">
                </div>
                <div class="form-group">
                    <label>SITHS-kort engångskostnad (kr)</label>
                    <input type="number" id="siths_engang" value="0" oninput="calculate()">
                </div>
                <div class="form-group">
                    <label>SITHS-kort löpande månadskostnad (kr)</label>
                    <input type="number" id="siths_lopande" value="0" oninput="calculate()">
                </div>
            </div>

            <div class="section" style="margin-top: 20px;">
                <h2>4. Sjukdom & SKR-Vite Simulator</h2>
                <div class="form-group">
                    <label>Antal simulerade sjuktimmar (1 pass = 8.6h)</label>
                    <input type="number" id="sjuktimmar" value="0" oninput="calculate()">
                </div>
                <div class="checkbox-group">
                    <input type="checkbox" id="skr_vite" onchange="calculate()">
                    <label for="skr_vite">Aktivera SKR Fast Vite (Tillfälle 4+): 10 000 kr</label>
                </div>
            </div>
        </div>
        
        <div class="result-side">
            <div class="section" style="background: white;">
                <h2 style="font-size: 18px;">Ekonomisk Specifikation — September 2026</h2>
                <p style="font-size: 12px; color: #64748b; margin-top: -5px;">Genererad i realtid. Justera värdena till vänster.</p>
                
                <table class="res-table">
                    <tr>
                        <td>Totala intäkter från kund</td>
                        <td style="text-align: right; font-weight: bold; color: #16a34a;" id="out_intakt">0 kr</td>
                    </tr>
                    <tr>
                        <td>Konsultens bruttolön <span style="font-size:11px; color:#64748b;">(inkl. ev. sjuklön, efter löneväxling)</span></td>
                        <td style="text-align: right;" id="out_brutto">0 kr</td>
                    </tr>
                    <tr>
                        <td>Arbetsgivaravgifter (31,42%)</td>
                        <td style="text-align: right;" id="out_sa">0 kr</td>
                    </tr>
                    <tr>
                        <td>Total Tjänstepension <span style="font-size:11px; color:#16a34a;">(Ordinarie + Löneväxling + 6% bonus)</span></td>
                        <td style="text-align: right;" id="out_pension">0 kr</td>
                    </tr>
                    <tr>
                        <td>Särskild löneskatt på pension (24,26%)</td>
                        <td style="text-align: right;" id="out_slr">0 kr</td>
                    </tr>
                    <tr>
                        <td>Skattefri milersättning (Utbetalas direkt)</td>
                        <td style="text-align: right;" id="out_mil">0 kr</td>
                    </tr>
                    <tr id="row_siths" style="display:none;">
                        <td>SITHS-kort (Kostnader)</td>
                        <td style="text-align: right;" id="out_siths">0 kr</td>
                    </tr>
                    <tr id="row_vite" style="display:none; color:#b91c1c; font-weight:bold;">
                        <td>SKR Fast Avtalsvite</td>
                        <td style="text-align: right;" id="out_vite">0 kr</td>
                    </tr>
                    <tr class="total">
                        <td>TOTAL SJÄLVKOSTNAD FÖR BOLAGET</td>
                        <td style="text-align: right;" id="out_totalkostnad">0 kr</td>
                    </tr>
                </table>
                
                <div class="tb-box">
                    <h3>KVARVARANDE TÄCKNINGSBIDRAG (VINST)</h3>
                    <div class="val" id="out_tb">0 kr</div>
                    <div style="font-size: 13px; color: #94a3b8;" id="out_marginal">Marginal: 0%</div>
                </div>
                
                <div style="margin-top: 20px; padding: 10px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 4px; font-size: 12px; color: #14532d;" id="box_pension_info">
                    <strong>Pensionsinfo:</strong> Avsättningen innehåller din ordinarie ITP-pension beräknad på lönen innan löneväxling, samt din löneväxling på 10 000 kr förstärkt med +6% extra bonus (10 600 kr totalt).
                </div>
            </div>
        </div>
    </div>
</div>

<script>
function calculate() {
    // Hämta inputs
    var kundpris = parseFloat(document.getElementById('kundpris').value) || 0;
    var timmar = parseFloat(document.getElementById('timmar').value) || 0;
    var konsultlon = parseFloat(document.getElementById('konsultlon').value) || 0;
    var lonevaxling = parseFloat(document.getElementById('lonevaxling').value) || 0;
    var mil = parseFloat(document.getElementById('mil').value) || 0;
    var krmil = parseFloat(document.getElementById('krmil').value) || 0;
    var siths_engang = parseFloat(document.getElementById('siths_engang').value) || 0;
    var siths_lopande = parseFloat(document.getElementById('siths_lopande').value) || 0;
    var sjuktimmar = parseFloat(document.getElementById('sjuktimmar').value) || 0;
    var skr_vite_aktivt = document.getElementById('skr_vite').checked;

    // 1. Beräkna arbetade timmar och intäkter
    var arbetade_timmar = Math.max(0, timmar - sjuktimmar);
    var total_intakt = arbetade_timmar * kundpris;

    // 2. Beräkna lön och sjuklön
    var grundlon_arbetad = arbetade_timmar * konsultlon;
    
    // Sjuklön: 1 pass (8h) karens, resten 80%
    var sjuklon_timmar = Math.max(0, sjuktimmar - 8);
    var sjuklon_belopp = sjuklon_timmar * (konsultlon * 0.8);
    
    var brutto_innan_lv = grundlon_arbetad + sjuklon_belopp;
    var brutto_efter_lv = Math.max(0, brutto_innan_lv - lonevaxling);

    // 3. Sociala avgifter
    var sa = brutto_efter_lv * 0.3142;

    // 4. Pension (ITP-trappan: 4.5% upp till 52125, 30% över. Baseras på brutto INNAN löneväxling)
    var p_lag = Math.min(brutto_innan_lv, 52125) * 0.045;
    var p_hog = Math.max(0, brutto_innan_lv - 52125) * 0.30;
    var ordinarie_pension = p_lag + p_hog;
    
    // Löneväxlingsdel inklusive 6% bonus
    var vaxlings_del = lonevaxling * 1.06;
    var total_pension = ordinarie_pension + vaxlings_del;
    var slr = total_pension * 0.2426;

    // 5. Övriga utgifter
    // Milersättning betalas bara för faktiska arbetade pass (räknar 8.6h per pass)
    var arbetade_pass = Math.ceil(arbetade_timmar / 8.6);
    var planerad_pass = Math.ceil(timmar / 8.6);
    var faktiskt_mil = (arbetade_pass / planerad_pass) * mil;
    if(timmar == 0 || arbetade_timmar == 0) faktiskt_mil = 0;
    
    var total_milersattning = faktiskt_mil * krmil;
    var siths_total = siths_engang + siths_lopande;
    
    var fast_vite = skr_vite_aktivt ? 10000 : 0;

    // 6. Totalsummering
    var total_kostnad = brutto_efter_lv + sa + total_pension + slr + total_milersattning + siths_total + fast_vite;
    var tb = total_intakt - total_kostnad;
    var marginal = total_intakt > 0 ? (tb / total_intakt) * 100 : 0;

    // Skriv ut resultat till skärmen
    document.getElementById('out_intakt').innerText = Math.round(total_intakt).toLocaleString('sv-SE') + " kr";
    document.getElementById('out_brutto').innerText = Math.round(brutto_efter_lv).toLocaleString('sv-SE') + " kr";
    document.getElementById('out_sa').innerText = Math.round(sa).toLocaleString('sv-SE') + " kr";
    document.getElementById('out_pension').innerText = Math.round(total_pension).toLocaleString('sv-SE') + " kr";
    document.getElementById('out_slr').innerText = Math.round(slr).toLocaleString('sv-SE') + " kr";
    document.getElementById('out_mil').innerText = Math.round(total_milersattning).toLocaleString('sv-SE') + " kr";
    
    if(siths_total > 0) {
        document.getElementById('row_siths').style.display = '';
        document.getElementById('out_siths').innerText = Math.round(siths_total).toLocaleString('sv-SE') + " kr";
    } else {
        document.getElementById('row_siths').style.display = 'none';
    }

    if(fast_vite > 0) {
        document.getElementById('row_vite').style.display = '';
        document.getElementById('out_vite').innerText = Math.round(fast_vite).toLocaleString('sv-SE') + " kr";
    } else {
        document.getElementById('row_vite').style.display = 'none';
    }

    document.getElementById('out_totalkostnad').innerText = Math.round(total_kostnad).toLocaleString('sv-SE') + " kr";
    
    var tb_element = document.getElementById('out_tb');
    tb_element.innerText = Math.round(tb).toLocaleString('sv-SE') + " kr";
    if(tb >= 0) {
        tb_element.style.color = '#34d399';
    } else {
        tb_element.style.color = '#f87171';
    }
    
    document.getElementById('out_marginal').innerText = "Marginal: " + marginal.toFixed(1) + "%";
}

// Kör direkt vid start
calculate();
</script>
</body>
</html>
