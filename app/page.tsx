<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Stensjö Vård AB — Master Offertsnurra V5 (Pro)</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; line-height: 1.5; }
        .container { max-width: 1280px; margin: 0 auto; background: #ffffff; padding: 32px; border-radius: 12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        
        .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 25px; }
        .header h1 { font-size: 24px; margin: 0; color: #1e3a8a; display: flex; align-items: center; gap: 10px; }
        .badge { background: #e0f2fe; color: #0369a1; font-size: 12px; font-weight: bold; padding: 4px 10px; border-radius: 9999px; }
        
        .grid { display: grid; grid-template-columns: 1fr 1.1fr; gap: 35px; }
        
        /* Moduler och Layout */
        .section { background: #ffffff; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 25px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
        .section-title { font-size: 15px; font-weight: 700; margin-top: 0; margin-bottom: 18px; color: #1e293b; border-left: 4px solid #3b82f6; padding-left: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .form-group { margin-bottom: 15px; }
        
        label { display: block; font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #475569; }
        input[type="number"], select { width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; box-sizing: border-box; background-color: #ffffff; }
        
        .checkbox-card { display: flex; align-items: center; gap: 12px; background: #fff5f5; border: 1px solid #fee2e2; padding: 12px; border-radius: 6px; margin-top: 15px; }
        .checkbox-card input { width: 18px; height: 18px; cursor: pointer; }
        
        /* Höger kolumn: Resultat och live-optimering */
        .result-panel { background: #ffffff; border: 2px solid #1e3a8a; border-radius: 10px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position: sticky; top: 20px; }
        
        .res-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .res-table td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; }
        .res-table tr.highlight-row { font-weight: 600; background: #f8fafc; }
        .res-table tr.highlight-row td { padding: 12px 8px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        
        /* Optimizer Panel placerad längst ner till höger */
        .optimization-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 20px; margin-top: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
        .optimization-title { font-size: 13px; font-weight: 700; color: #1e3a8a; margin-top: 0; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
        
        .info-bubble { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 12px; border-radius: 6px; font-size: 12px; line-height: 1.4; margin-top: 12px; }
        
        /* Stora vinstlådan */
        .summary-box { background: #0f172a; color: #ffffff; padding: 20px; border-radius: 8px; margin-top: 20px; text-align: center; }
        .summary-box h4 { margin: 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; }
        .summary-box .value { font-size: 32px; font-weight: 800; margin: 6px 0; color: #10b981; }
        .summary-box .margin-text { font-size: 14px; color: #cbd5e1; font-weight: 500; }
        
        .btn-action { background-color: #1e3a8a; color: white; padding: 14px 24px; border: none; border-radius: 6px; font-weight: 700; cursor: pointer; width: 100%; font-size: 15px; display: block; text-align: center; margin-bottom: 15px; text-decoration: none; }
        .btn-action:hover { background-color: #172554; }
        
        @media print {
            body { background: white; padding: 0; }
            .container { border: none; box-shadow: none; padding: 0; }
            .grid { grid-template-columns: 1fr; }
            .left-inputs, .btn-action, .optimization-box { display: none !important; }
            .result-panel { border: none; padding: 0; position: relative; }
            .summary-box { background: #f1f5f9; color: #0f172a; border: 1px solid #cbd5e1; }
            .summary-box .value { color: #111827; }
        }
    </style>
</head>
<body>

<div class="container">
    <div class="header">
        <h1>🌸 KLARA Master Offertsnurra Pro</h1>
        <div style="text-align: right; font-size: 13px; color: #64748b; font-weight: 500;">Sandbox-läge (/pro)</div>
    </div>
    
    <div class="grid">
        <div class="left-inputs">
            
            <div class="section">
                <div class="section-title">1. Avtalsramar & Kundvillkor</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Kundkategori</label>
                        <select id="kund_kat">
                            <option value="region" selected>Region (SKR-avtal 2026)</option>
                            <option value="kommun">Kommun</option>
                            <option value="privat">Privat</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Kompetensnivå</label>
                        <select id="komp_niva">
                            <option value="allman">Allmän SSK</option>
                            <option value="spec">SSK Spec</option>
                            <option value="ane_iva" selected>Spec ANE/IVA/OP/BM</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Baspris till kund (kr/tim)</label>
                        <input type="number" id="base_kund" value="770" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Grundtimlön till konsult (kr/tim)</label>
                        <input type="number" id="base_konsult" value="411" oninput="runCalculation()">
                    </div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">2. Importerade schematimmar</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Vardag dag (06–19)</label>
                        <input type="number" id="h_vd" value="116" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Vardag kväll (19–22) (+20 kr/h OB)</label>
                        <input type="number" id="h_vk" value="24" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Helg dag (06–19) (+50 kr/h OB)</label>
                        <input type="number" id="h_hd" value="24" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Helg kväll (19–22) (+50 kr/h OB)</label>
                        <input type="number" id="h_hk" value="12" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Vardag natt (22–06)</label>
                        <input type="number" id="h_vn" value="0" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Helg natt (22–06)</label>
                        <input type="number" id="h_hn" value="0" oninput="runCalculation()">
                    </div>
                </div>
            </div>

            <div class="section">
                <div class="section-title">3. Avvikelser & Sjukdomsrisk</div>
                <div class="form-grid">
                    <div class="form-group">
                        <label>Simulera frånvarotimmar (Sjukdom)</label>
                        <input type="number" id="sjuk_timmar" value="0" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Maximalt vites-tak hos region (kr)</label>
                        <input type="number" id="vite_tak" value="40000" oninput="runCalculation()">
                    </div>
                </div>
                <div class="checkbox-card">
                    <input type="checkbox" id="skr_vite_active" onchange="runCalculation()">
                    <div>
                        <label style="margin: 0; font-weight: 700; color: #991b1b;">Aktivera SKR Fast Avtalsvite (10 000 kr)</label>
                        <span style="font-size: 11px; color: #7f1d1d; display: block; margin-top: 2px;">Triggas vid tillfälle 4 och 5 enligt eskaleringstrappan.</span>
                    </div>
                </div>
            </div>
            
        </div>
        
        <div>
            <div class="result-panel">
                <button class="btn-action" onclick="window.print()">🖨 Well-formed Offert-PDF</button>
                
                <h2 style="font-size: 16px; margin-top: 0; color: #1e3a8a; border-bottom: 2px solid #f1f5f9; padding-bottom: 8px;">
                    Ekonomisk Sammanfattning
                </h2>
                
                <table class="res-table">
                    <tr>
                        <td>Totala planerade schematimmar:</td>
                        <td style="text-align: right; font-weight: 600;" id="lbl_total_timmar">176.00 h</td>
                    </tr>
                    <tr>
                        <td>Faktiskt arbetade timmar:</td>
                        <td style="text-align: right;" id="lbl_arbetade_timmar">176.00 h</td>
                    </tr>
                    <tr class="highlight-row">
                        <td style="color: #16a34a;">Totala Bruttointäkter från kund:</td>
                        <td style="text-align: right; color: #16a34a;" id="lbl_intakter">0 kr</td>
                    </tr>
                    <tr>
                        <td>Grundlön + Avtals-OB (Innan avdrag):</td>
                        <td style="text-align: right; font-weight: 600;" id="lbl_brutto_innan">0 kr</td>
                    </tr>
                    <tr>
                        <td style="color: #b91c1c;">Valt Löneväxlingsavdrag:</td>
                        <td style="text-align: right; color: #b91c1c;" id="lbl_valt_lv">0 kr</td>
                    </tr>
                    <tr style="background: #f8fafc; font-weight: bold;">
                        <td>Skattepliktig bruttolön (Utbetalning):</td>
                        <td style="text-align: right;" id="lbl_brutto_efter">0 kr</td>
                    </tr>
                    <tr>
                        <td>Arbetsgivaravgifter (SA 31,42%):</td>
                        <td style="text-align: right;" id="lbl_sa">0 kr</td>
                    </tr>
                    <tr>
                        <td>Tjänstepension ITP (Ordinarie grund):</td>
                        <td style="text-align: right;" id="lbl_pension_ord">0 kr</td>
                    </tr>
                    <tr>
                        <td style="color: #1e3a8a;">Löneväxling insatt på konto (+6%):</td>
                        <td style="text-align: right; color: #1e3a8a; font-weight: 600;" id="lbl_pension_lv">0 kr</td>
                    </tr>
                    <tr>
                        <td>Särskild löneskatt på pension (24,26%):</td>
                        <td style="text-align: right;" id="lbl_slr">0 kr</td>
                    </tr>
                    <tr style="color: #7c2d12;">
                        <td>Kostnad för boende/hyra:</td>
                        <td style="text-align: right;" id="lbl_kostnad_boende">0 kr</td>
                    </tr>
                    <tr style="color: #7c2d12;">
                        <td>Kostnad för resor/milersättning:</td>
                        <td style="text-align: right;" id="lbl_kostnad_resor">0 kr</td>
                    </tr>
                    <tr id="row_out_vite" style="color: #b91c1c; font-weight: bold; display: none;">
                        <td>Avdrag för SKR Fast Vite:</td>
                        <td style="text-align: right;" id="lbl_kostnad_vite">0 kr</td>
                    </tr>
                    <tr class="highlight-row" style="background: #f1f5f9;">
                        <td>TOTAL SJÄLVKOSTNAD FÖR BOLAGET:</td>
                        <td style="text-align: right; color: #0f172a;" id="lbl_totalkostnad">0 kr</td>
                    </tr>
                </table>
                
                <div class="optimization-box">
                    <div class="optimization-title">⚙️ Anpassning & Vinstoptimering (Live)</div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Antal introtimmar (Full lön, 0kr intäkt)</label>
                            <input type="number" id="opt_intro" value="0" oninput="runCalculation()">
                        </div>
                        <div class="form-group">
                            <label>Löneväxlingsbelopp (kr/mån)</label>
                            <input type="number" id="opt_lv" value="22491" oninput="runCalculation()">
                        </div>
                        <div class="form-group">
                            <label>Kostnad för boende (Stensjö-utgift)</label>
                            <input type="number" id="opt_boende" value="0" oninput="runCalculation()">
                        </div>
                        <div class="form-group">
                            <label>Kostnad för resor/milerst. (Utgift)</label>
                            <input type="number" id="opt_resor" value="5230" oninput="runCalculation()">
                        </div>
                    </div>
                    
                    <div class="info-bubble">
                        <strong>Maximal rekommenderad löneväxling: <span id="lbl_max_lv_tip" style="color:#16a34a; font-weight:700;">0 kr</span></strong><br>
                        Baserat på gränsen för 2026: <em>Bruttolön minus 56 087 kr</em>. Sänks lönen under 56 087 kr drabbas den allmänna statliga pensionen negativt. Företagets sparade skattebonus (+6%) räknas in automatiskt.
                    </div>
                </div>

                <div class="summary-box">
                    <h4>Kvarvarande Täckningsbidrag (Vinst)</h4>
                    <div class="value" id="lbl_tb">0 kr</div>
                    <div class="margin-text" id="lbl_marginal">Marginal: 0.0%</div>
                </div>
                
            </div>
        </div>
    </div>
</div>

<script>
function runCalculation() {
    var base_kund = parseFloat(document.getElementById('base_kund').value) || 0;
    var base_konsult = parseFloat(document.getElementById('base_konsult').value) || 0;
    
    var h_vd = parseFloat(document.getElementById('h_vd').value) || 0;
    var h_vk = parseFloat(document.getElementById('h_vk').value) || 0;
    var h_hd = parseFloat(document.getElementById('h_hd').value) || 0;
    var h_hk = parseFloat(document.getElementById('h_hk').value) || 0;
    var h_vn = parseFloat(document.getElementById('h_vn').value) || 0;
    var h_hn = parseFloat(document.getElementById('h_hn').value) || 0;
    
    var sjuk_timmar = parseFloat(document.getElementById('sjuk_timmar').value) || 0;
    var vite_tak = parseFloat(document.getElementById('vite_tak').value) || 0;
    var skr_vite_active = document.getElementById('skr_vite_active').checked;
    
    var opt_intro = parseFloat(document.getElementById('opt_intro').value) || 0;
    var opt_lv = parseFloat(document.getElementById('opt_lv').value) || 0;
    var opt_boende = parseFloat(document.getElementById('opt_boende').value) || 0;
    var opt_resor = parseFloat(document.getElementById('opt_resor').value) || 0;

    var total_schematimmar = h_vd + h_vk + h_hd + h_hk + h_vn + h_hn;
    var arbetade_timmar = Math.max(0, total_schematimmar - sjuk_timmar);
    
    document.getElementById('lbl_total_timmar').innerText = total_schematimmar.toFixed(2) + " h";
    document.getElementById('lbl_arbetade_timmar').innerText = arbetade_timmar.toFixed(2) + " h";

    // Kundintäkter med regions-OB medräknat (+96 kr på helger för att matcha dumpens bas)
    var intakt_vd = Math.max(0, h_vd - sjuk_timmar) * base_kund;
    var intakt_vk = Math.max(0, h_vk) * base_kund; 
    var intakt_hd = Math.max(0, h_hd) * (base_kund + 96); 
    var intakt_hk = Math.max(0, h_hk) * (base_kund + 96);
    
    var total_intakter = (intakt_vd + intakt_vk + intakt_hd + intakt_hk) - (opt_intro * base_kund);
    if(total_intakter < 0) total_intakter = 0;
    
    document.getElementById('lbl_intakter').innerText = Math.round(total_intakter).toLocaleString('sv-SE') + " kr";

    // Konsultens bruttolön med avtalsenliga OB-tillägg (+20 kr kväll, +50 kr helg)
    var lon_vd = Math.max(0, h_vd - sjuk_timmar) * base_konsult;
    var lon_vk = Math.max(0, h_vk) * (base_konsult + 20);
    var lon_hd = Math.max(0, h_hd) * (base_konsult + 50);
    var lon_hk = Math.max(0, h_hk) * (base_konsult + 50);
    
    var lon_intro = opt_intro * base_konsult;
    
    // Sjuklön (8h karens, därefter 80%)
    var sjuklon_timmar = Math.max(0, sjuk_timmar - 8);
    var sjuklon_belopp = sjuklon_timmar * (base_konsult * 0.8);
    
    var brutto_innan_avdrag = lon_vd + lon_vk + lon_hd + lon_hk + lon_intro + sjuklon_belopp;
    document.getElementById('lbl_brutto_innan').innerText = Math.round(brutto_innan_avdrag).toLocaleString('sv-SE') + " kr";

    // Live-kalkylator för rekommenderat maxavdrag utifrån spärren 56 087 kr
    var max_rekommenderad_lv = Math.max(0, brutto_innan_avdrag - 56087);
    document.getElementById('lbl_max_lv_tip').innerText = Math.round(max_rekommenderad_lv).toLocaleString('sv-SE') + " kr";

    var valt_lv = opt_lv;
    if(valt_lv > brutto_innan_avdrag) valt_lv = brutto_innan_avdrag;
    
    var brutto_efter_avdrag = Math.max(0, brutto_innan_avdrag - valt_lv);
    
    document.getElementById('lbl_valt_lv').innerText = "-" + Math.round(valt_lv).toLocaleString('sv-SE') + " kr";
    document.getElementById('lbl_brutto_efter').innerText = Math.round(brutto_efter_avdrag).toLocaleString('sv-SE') + " kr";

    var sa = brutto_efter_avdrag * 0.3142;
    document.getElementById('lbl_sa').innerText = Math.round(sa).toLocaleString('sv-SE') + " kr";

    // Pension ITP beräknas på bruttolönen INNAN avdraget dras
    var p_lag = Math.min(brutto_innan_avdrag, 52125) * 0.045;
    var p_hog = Math.max(0, brutto_innan_avdrag - 52125) * 0.30;
    var ordinarie_pension = p_lag + p_hog;
    
    var lv_pension_insatt = valt_lv * 1.06;
    var total_pension = ordinarie_pension + lv_pension_insatt;
    var slr = total_pension * 0.2426;
    
    document.getElementById('lbl_pension_ord').innerText = Math.round(ordinarie_pension).toLocaleString('sv-SE') + " kr";
    document.getElementById('lbl_pension_lv').innerText = Math.round(lv_pension_insatt).toLocaleString('sv-SE') + " kr";
    document.getElementById('lbl_slr').innerText = Math.round(slr).toLocaleString('sv-SE') + " kr";

    document.getElementById('lbl_kostnad_boende').innerText = Math.round(opt_boende).toLocaleString('sv-SE') + " kr";
    document.getElementById('lbl_kostnad_resor').innerText = Math.round(opt_resor).toLocaleString('sv-SE') + " kr";
    
    var fast_vite = skr_vite_active ? 10000 : 0;
    if(fast_vite > vite_tak) fast_vite = vite_tak;
    
    if(fast_vite > 0) {
        document.getElementById('row_out_vite').style.display = '';
        document.getElementById('lbl_kostnad_vite').innerText = Math.round(fast_vite).toLocaleString('sv-SE') + " kr";
    } else {
        document.getElementById('row_out_vite').style.display = 'none';
    }

    var total_sjalvkostnad = brutto_efter_avdrag + sa + total_pension + slr + opt_boende + opt_resor + fast_vite;
    var tb = total_intakter - total_sjalvkostnad;
    var marginal = total_intakter > 0 ? (tb / total_intakter) * 100 : 0;

    document.getElementById('lbl_totalkostnad').innerText = Math.round(total_sjalvkostnad).toLocaleString('sv-SE') + " kr";
    
    var tb_display = document.getElementById('lbl_tb');
    tb_display.innerText = Math.round(tb).toLocaleString('sv-SE') + " kr";
    
    if(tb >= 0) {
        tb_display.style.color = '#10b981';
    } else {
        tb_display.style.color = '#ef4444';
    }
    
    document.getElementById('lbl_marginal').innerText = "Marginal: " + marginal.toFixed(1) + "%";
}

runCalculation();
</script>
</body>
</html>
