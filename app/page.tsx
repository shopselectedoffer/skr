<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <title>Stensjö Vård AB — Master Offertsnurra V5.1 (Pro)</title>
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
        
        /* Mobilbrytpunkt */
        @media (max-width: 768px) {
            .grid { grid-template-columns: 1fr; }
            body { padding: 12px; }
            .container { padding: 16px; }
            .result-panel { position: relative; top: 0; margin-top: 20px; }
        }

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
                        <label>Vardag natt (22–06) (+40 kr/h OB)</label>
                        <input type="number" id="h_vn" value="0" oninput="runCalculation()">
                    </div>
                    <div class="form-group">
                        <label>Helg natt (22–06) (+50 kr/h OB)</label>
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
                <button class="btn-action" onclick="window.print()">🖨 Generera & Skriv ut Offert-PDF</button>
                
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
                        <td style="text-align:
