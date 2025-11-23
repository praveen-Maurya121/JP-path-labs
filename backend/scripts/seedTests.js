import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/Test.js';

dotenv.config();

const tests = [
  // Complete Blood Count (CBC) Tests
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Complete blood count including RBC, WBC, platelets, hemoglobin, and hematocrit' },
  { name: 'Hemoglobin (Hb)', category: 'Hematology', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Hemoglobin level measurement' },
  { name: 'Hematocrit (Hct)', category: 'Hematology', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Hematocrit percentage measurement' },
  { name: 'Red Blood Cell Count (RBC)', category: 'Hematology', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Red blood cell count' },
  { name: 'White Blood Cell Count (WBC)', category: 'Hematology', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'White blood cell count' },
  { name: 'Platelet Count', category: 'Hematology', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Platelet count measurement' },
  { name: 'Mean Corpuscular Volume (MCV)', category: 'Hematology', price: 100, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Average red blood cell size' },
  { name: 'Mean Corpuscular Hemoglobin (MCH)', category: 'Hematology', price: 100, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Average hemoglobin per red blood cell' },
  { name: 'Erythrocyte Sedimentation Rate (ESR)', category: 'Hematology', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'ESR measurement for inflammation' },
  { name: 'Peripheral Blood Smear', category: 'Hematology', price: 250, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Microscopic examination of blood cells' },

  // Liver Function Tests
  { name: 'Liver Function Test (LFT)', category: 'Liver Function', price: 500, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Complete liver function panel including ALT, AST, ALP, bilirubin' },
  { name: 'Alanine Aminotransferase (ALT/SGPT)', category: 'Liver Function', price: 200, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'ALT enzyme level for liver health' },
  { name: 'Aspartate Aminotransferase (AST/SGOT)', category: 'Liver Function', price: 200, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'AST enzyme level for liver health' },
  { name: 'Alkaline Phosphatase (ALP)', category: 'Liver Function', price: 200, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'ALP enzyme level' },
  { name: 'Total Bilirubin', category: 'Liver Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Total bilirubin level' },
  { name: 'Direct Bilirubin', category: 'Liver Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Direct bilirubin level' },
  { name: 'Indirect Bilirubin', category: 'Liver Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Indirect bilirubin level' },
  { name: 'Total Protein', category: 'Liver Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Total protein level' },
  { name: 'Albumin', category: 'Liver Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Albumin level' },
  { name: 'Globulin', category: 'Liver Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Globulin level' },
  { name: 'A/G Ratio', category: 'Liver Function', price: 100, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Albumin to Globulin ratio' },
  { name: 'Gamma Glutamyl Transferase (GGT)', category: 'Liver Function', price: 200, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'GGT enzyme level' },

  // Kidney Function Tests
  { name: 'Kidney Function Test (KFT)', category: 'Kidney Function', price: 400, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Complete kidney function panel' },
  { name: 'Blood Urea Nitrogen (BUN)', category: 'Kidney Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'BUN level for kidney function' },
  { name: 'Serum Creatinine', category: 'Kidney Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Creatinine level for kidney function' },
  { name: 'Uric Acid', category: 'Kidney Function', price: 200, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Uric acid level' },
  { name: 'Serum Urea', category: 'Kidney Function', price: 150, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Serum urea level' },
  { name: 'Creatinine Clearance', category: 'Kidney Function', price: 300, sampleType: 'Blood & Urine', preparation: '24-hour urine collection required', description: 'Creatinine clearance rate' },
  { name: 'eGFR (Estimated GFR)', category: 'Kidney Function', price: 200, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Estimated glomerular filtration rate' },

  // Lipid Profile
  { name: 'Lipid Profile', category: 'Cardiac', price: 500, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'Complete lipid panel including cholesterol and triglycerides' },
  { name: 'Total Cholesterol', category: 'Cardiac', price: 200, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'Total cholesterol level' },
  { name: 'HDL Cholesterol', category: 'Cardiac', price: 200, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'High-density lipoprotein (good cholesterol)' },
  { name: 'LDL Cholesterol', category: 'Cardiac', price: 200, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'Low-density lipoprotein (bad cholesterol)' },
  { name: 'VLDL Cholesterol', category: 'Cardiac', price: 200, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'Very low-density lipoprotein' },
  { name: 'Triglycerides', category: 'Cardiac', price: 200, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'Triglyceride level' },
  { name: 'Total Cholesterol/HDL Ratio', category: 'Cardiac', price: 100, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'Cholesterol to HDL ratio' },
  { name: 'Non-HDL Cholesterol', category: 'Cardiac', price: 150, sampleType: 'Blood', preparation: 'Fasting 12-14 hours required', description: 'Non-HDL cholesterol calculation' },

  // Diabetes Tests
  { name: 'Fasting Blood Sugar (FBS)', category: 'Diabetes', price: 100, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Fasting blood glucose level' },
  { name: 'Post Prandial Blood Sugar (PPBS)', category: 'Diabetes', price: 100, sampleType: 'Blood', preparation: '2 hours after meal', description: 'Post-meal blood glucose level' },
  { name: 'Random Blood Sugar (RBS)', category: 'Diabetes', price: 100, sampleType: 'Blood', preparation: 'No fasting required', description: 'Random blood glucose level' },
  { name: 'HbA1c (Glycated Hemoglobin)', category: 'Diabetes', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Average blood sugar over 2-3 months' },
  { name: 'Oral Glucose Tolerance Test (OGTT)', category: 'Diabetes', price: 500, sampleType: 'Blood', preparation: 'Fasting 10-12 hours, then 2 hours after glucose', description: 'Glucose tolerance test' },
  { name: 'Insulin Fasting', category: 'Diabetes', price: 600, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Fasting insulin level' },
  { name: 'C-Peptide', category: 'Diabetes', price: 800, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'C-Peptide level for insulin production' },
  { name: 'Glucose Random', category: 'Diabetes', price: 100, sampleType: 'Blood', preparation: 'No fasting required', description: 'Random glucose measurement' },

  // Thyroid Function Tests
  { name: 'Thyroid Function Test (TFT)', category: 'Thyroid', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Complete thyroid panel including T3, T4, TSH' },
  { name: 'TSH (Thyroid Stimulating Hormone)', category: 'Thyroid', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'TSH level for thyroid function' },
  { name: 'Free T3 (Triiodothyronine)', category: 'Thyroid', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Free T3 hormone level' },
  { name: 'Free T4 (Thyroxine)', category: 'Thyroid', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Free T4 hormone level' },
  { name: 'Total T3', category: 'Thyroid', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Total T3 hormone level' },
  { name: 'Total T4', category: 'Thyroid', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Total T4 hormone level' },
  { name: 'Anti-TPO (Thyroid Peroxidase Antibody)', category: 'Thyroid', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anti-TPO antibody test' },
  { name: 'Anti-TG (Thyroglobulin Antibody)', category: 'Thyroid', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anti-thyroglobulin antibody test' },
  { name: 'Reverse T3', category: 'Thyroid', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Reverse T3 hormone level' },

  // Cardiac Markers
  { name: 'Cardiac Profile', category: 'Cardiac', price: 1200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Complete cardiac marker panel' },
  { name: 'Troponin I', category: 'Cardiac', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Troponin I for heart attack detection' },
  { name: 'Troponin T', category: 'Cardiac', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Troponin T for heart attack detection' },
  { name: 'CK-MB (Creatine Kinase-MB)', category: 'Cardiac', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'CK-MB for heart muscle damage' },
  { name: 'BNP (Brain Natriuretic Peptide)', category: 'Cardiac', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'BNP for heart failure assessment' },
  { name: 'NT-proBNP', category: 'Cardiac', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'NT-proBNP for heart failure' },
  { name: 'Homocysteine', category: 'Cardiac', price: 800, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Homocysteine level for cardiovascular risk' },
  { name: 'High Sensitivity CRP (hs-CRP)', category: 'Cardiac', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'High sensitivity C-reactive protein' },

  // Vitamin Tests
  { name: 'Vitamin D (25-OH)', category: 'Vitamins', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vitamin D level measurement' },
  { name: 'Vitamin B12', category: 'Vitamins', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vitamin B12 level' },
  { name: 'Folic Acid (Folate)', category: 'Vitamins', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Folic acid level' },
  { name: 'Vitamin B1 (Thiamine)', category: 'Vitamins', price: 700, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vitamin B1 level' },
  { name: 'Vitamin B6 (Pyridoxine)', category: 'Vitamins', price: 700, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vitamin B6 level' },
  { name: 'Vitamin C (Ascorbic Acid)', category: 'Vitamins', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vitamin C level' },
  { name: 'Vitamin A', category: 'Vitamins', price: 800, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Vitamin A level' },
  { name: 'Vitamin E', category: 'Vitamins', price: 800, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Vitamin E level' },
  { name: 'Vitamin K', category: 'Vitamins', price: 700, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vitamin K level' },

  // Urine Tests
  { name: 'Complete Urine Analysis (CUE)', category: 'Urine', price: 200, sampleType: 'Urine', preparation: 'Mid-stream clean catch sample', description: 'Complete urine examination' },
  { name: 'Urine Culture & Sensitivity', category: 'Urine', price: 400, sampleType: 'Urine', preparation: 'Mid-stream clean catch sample', description: 'Bacterial culture and antibiotic sensitivity' },
  { name: '24 Hour Urine Protein', category: 'Urine', price: 300, sampleType: 'Urine', preparation: '24-hour urine collection', description: '24-hour protein excretion' },
  { name: '24 Hour Urine Creatinine', category: 'Urine', price: 300, sampleType: 'Urine', preparation: '24-hour urine collection', description: '24-hour creatinine clearance' },
  { name: 'Microalbuminuria', category: 'Urine', price: 500, sampleType: 'Urine', preparation: 'First morning sample preferred', description: 'Microalbumin in urine for kidney damage' },
  { name: 'Urine Pregnancy Test', category: 'Urine', price: 200, sampleType: 'Urine', preparation: 'First morning sample preferred', description: 'Pregnancy detection test' },
  { name: 'Urine Albumin/Creatinine Ratio', category: 'Urine', price: 400, sampleType: 'Urine', preparation: 'Random sample', description: 'Albumin to creatinine ratio' },

  // Hormone Tests
  { name: 'Testosterone Total', category: 'Hormones', price: 800, sampleType: 'Blood', preparation: 'Fasting not required, morning sample preferred', description: 'Total testosterone level' },
  { name: 'Testosterone Free', category: 'Hormones', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required, morning sample preferred', description: 'Free testosterone level' },
  { name: 'Estradiol (E2)', category: 'Hormones', price: 700, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Estradiol hormone level' },
  { name: 'Progesterone', category: 'Hormones', price: 700, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Progesterone hormone level' },
  { name: 'Prolactin', category: 'Hormones', price: 600, sampleType: 'Blood', preparation: 'Fasting not required, morning sample', description: 'Prolactin hormone level' },
  { name: 'LH (Luteinizing Hormone)', category: 'Hormones', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'LH hormone level' },
  { name: 'FSH (Follicle Stimulating Hormone)', category: 'Hormones', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'FSH hormone level' },
  { name: 'Cortisol', category: 'Hormones', price: 600, sampleType: 'Blood', preparation: 'Morning sample preferred (8 AM)', description: 'Cortisol hormone level' },
  { name: 'DHEA-S (Dehydroepiandrosterone)', category: 'Hormones', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'DHEA-S level' },
  { name: 'SHBG (Sex Hormone Binding Globulin)', category: 'Hormones', price: 700, sampleType: 'Blood', preparation: 'Fasting not required', description: 'SHBG level' },
  { name: 'Growth Hormone (GH)', category: 'Hormones', price: 1000, sampleType: 'Blood', preparation: 'Fasting required', description: 'Growth hormone level' },
  { name: 'IGF-1 (Insulin-like Growth Factor)', category: 'Hormones', price: 1200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'IGF-1 level' },

  // Infectious Disease Tests
  { name: 'HIV 1 & 2 Antibody', category: 'Infectious Disease', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'HIV antibody screening test' },
  { name: 'HBsAg (Hepatitis B Surface Antigen)', category: 'Infectious Disease', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Hepatitis B surface antigen test' },
  { name: 'Anti-HCV (Hepatitis C Antibody)', category: 'Infectious Disease', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Hepatitis C antibody test' },
  { name: 'Hepatitis A IgM', category: 'Infectious Disease', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Hepatitis A IgM antibody' },
  { name: 'Hepatitis A IgG', category: 'Infectious Disease', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Hepatitis A IgG antibody' },
  { name: 'VDRL/RPR (Syphilis)', category: 'Infectious Disease', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Syphilis screening test' },
  { name: 'TPHA (Treponema Pallidum)', category: 'Infectious Disease', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Syphilis confirmatory test' },
  { name: 'Dengue NS1 Antigen', category: 'Infectious Disease', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Dengue NS1 antigen test' },
  { name: 'Dengue IgG/IgM', category: 'Infectious Disease', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Dengue antibody test' },
  { name: 'Malaria Parasite (MP)', category: 'Infectious Disease', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Malaria parasite detection' },
  { name: 'Typhoid (Widal Test)', category: 'Infectious Disease', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Typhoid antibody test' },
  { name: 'COVID-19 RT-PCR', category: 'Infectious Disease', price: 800, sampleType: 'Nasopharyngeal Swab', preparation: 'No preparation required', description: 'COVID-19 RT-PCR test' },
  { name: 'COVID-19 Rapid Antigen', category: 'Infectious Disease', price: 400, sampleType: 'Nasopharyngeal Swab', preparation: 'No preparation required', description: 'COVID-19 rapid antigen test' },
  { name: 'Tuberculosis (TB) Gold Test', category: 'Infectious Disease', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'TB interferon-gamma release assay' },
  { name: 'Chikungunya IgM/IgG', category: 'Infectious Disease', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Chikungunya antibody test' },

  // Tumor Markers
  { name: 'PSA (Prostate Specific Antigen)', category: 'Tumor Markers', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Prostate cancer marker' },
  { name: 'Free PSA', category: 'Tumor Markers', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Free PSA for prostate cancer' },
  { name: 'CA 125 (Cancer Antigen 125)', category: 'Tumor Markers', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Ovarian cancer marker' },
  { name: 'CA 19-9', category: 'Tumor Markers', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Pancreatic and gastrointestinal cancer marker' },
  { name: 'CEA (Carcinoembryonic Antigen)', category: 'Tumor Markers', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Colorectal cancer marker' },
  { name: 'AFP (Alpha Fetoprotein)', category: 'Tumor Markers', price: 700, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Liver and testicular cancer marker' },
  { name: 'CA 15-3', category: 'Tumor Markers', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Breast cancer marker' },
  { name: 'CA 27.29', category: 'Tumor Markers', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Breast cancer marker' },
  { name: 'Beta HCG (Quantitative)', category: 'Tumor Markers', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Pregnancy and germ cell tumor marker' },
  { name: 'NSE (Neuron Specific Enolase)', category: 'Tumor Markers', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Small cell lung cancer marker' },

  // Electrolytes
  { name: 'Electrolyte Panel', category: 'Electrolytes', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Complete electrolyte panel' },
  { name: 'Sodium (Na)', category: 'Electrolytes', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Sodium level' },
  { name: 'Potassium (K)', category: 'Electrolytes', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Potassium level' },
  { name: 'Chloride (Cl)', category: 'Electrolytes', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Chloride level' },
  { name: 'Calcium (Ca)', category: 'Electrolytes', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Calcium level' },
  { name: 'Phosphorus (P)', category: 'Electrolytes', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Phosphorus level' },
  { name: 'Magnesium (Mg)', category: 'Electrolytes', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Magnesium level' },
  { name: 'Ionized Calcium', category: 'Electrolytes', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Ionized calcium level' },

  // Iron Studies
  { name: 'Iron Studies', category: 'Hematology', price: 600, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Complete iron panel' },
  { name: 'Serum Iron', category: 'Hematology', price: 300, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Serum iron level' },
  { name: 'TIBC (Total Iron Binding Capacity)', category: 'Hematology', price: 300, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Total iron binding capacity' },
  { name: 'Transferrin', category: 'Hematology', price: 400, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Transferrin level' },
  { name: 'Ferritin', category: 'Hematology', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Ferritin level (iron storage)' },
  { name: 'Transferrin Saturation', category: 'Hematology', price: 200, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Transferrin saturation percentage' },

  // Coagulation Tests
  { name: 'PT/INR (Prothrombin Time)', category: 'Coagulation', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Prothrombin time and INR' },
  { name: 'APTT (Activated Partial Thromboplastin Time)', category: 'Coagulation', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'APTT for clotting function' },
  { name: 'Bleeding Time', category: 'Coagulation', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Bleeding time measurement' },
  { name: 'Clotting Time', category: 'Coagulation', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Clotting time measurement' },
  { name: 'D-Dimer', category: 'Coagulation', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'D-Dimer for blood clot detection' },
  { name: 'Fibrinogen', category: 'Coagulation', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Fibrinogen level' },
  { name: 'Protein C', category: 'Coagulation', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Protein C level' },
  { name: 'Protein S', category: 'Coagulation', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Protein S level' },
  { name: 'Antithrombin III', category: 'Coagulation', price: 1200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Antithrombin III level' },

  // Autoimmune Tests
  { name: 'ANA (Antinuclear Antibody)', category: 'Autoimmune', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Antinuclear antibody test' },
  { name: 'RF (Rheumatoid Factor)', category: 'Autoimmune', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Rheumatoid factor test' },
  { name: 'Anti-CCP (Cyclic Citrullinated Peptide)', category: 'Autoimmune', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anti-CCP antibody for rheumatoid arthritis' },
  { name: 'Anti-dsDNA', category: 'Autoimmune', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anti-double stranded DNA antibody' },
  { name: 'Anti-SSA/Ro', category: 'Autoimmune', price: 1200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anti-SSA/Ro antibody' },
  { name: 'Anti-SSB/La', category: 'Autoimmune', price: 1200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anti-SSB/La antibody' },
  { name: 'ANCA (Antineutrophil Cytoplasmic Antibody)', category: 'Autoimmune', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'ANCA antibody test' },

  // Allergy Tests
  { name: 'Total IgE', category: 'Allergy', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Total immunoglobulin E level' },
  { name: 'Food Allergy Panel', category: 'Allergy', price: 3000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Comprehensive food allergy panel' },
  { name: 'Inhalant Allergy Panel', category: 'Allergy', price: 3000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Comprehensive inhalant allergy panel' },
  { name: 'Specific IgE (Single Allergen)', category: 'Allergy', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Specific allergen IgE test' },

  // Stool Tests
  { name: 'Stool Routine Examination', category: 'Stool', price: 200, sampleType: 'Stool', preparation: 'Fresh sample in sterile container', description: 'Complete stool examination' },
  { name: 'Stool Culture & Sensitivity', category: 'Stool', price: 500, sampleType: 'Stool', preparation: 'Fresh sample in sterile container', description: 'Bacterial culture and sensitivity' },
  { name: 'Stool for Ova & Cyst', category: 'Stool', price: 200, sampleType: 'Stool', preparation: 'Fresh sample in sterile container', description: 'Parasite detection in stool' },
  { name: 'Stool Occult Blood', category: 'Stool', price: 300, sampleType: 'Stool', preparation: 'Avoid red meat 3 days before', description: 'Hidden blood in stool test' },
  { name: 'Stool Reducing Substances', category: 'Stool', price: 300, sampleType: 'Stool', preparation: 'Fresh sample', description: 'Reducing substances in stool' },
  { name: 'Stool pH', category: 'Stool', price: 150, sampleType: 'Stool', preparation: 'Fresh sample', description: 'Stool pH measurement' },

  // Semen Analysis
  { name: 'Semen Analysis', category: 'Fertility', price: 500, sampleType: 'Semen', preparation: 'Abstinence 3-5 days, collect in sterile container', description: 'Complete semen analysis' },
  { name: 'Sperm Count', category: 'Fertility', price: 300, sampleType: 'Semen', preparation: 'Abstinence 3-5 days', description: 'Sperm count measurement' },
  { name: 'Sperm Morphology', category: 'Fertility', price: 400, sampleType: 'Semen', preparation: 'Abstinence 3-5 days', description: 'Sperm shape and structure analysis' },
  { name: 'Sperm Motility', category: 'Fertility', price: 300, sampleType: 'Semen', preparation: 'Abstinence 3-5 days', description: 'Sperm movement analysis' },

  // Pregnancy Tests
  { name: 'Beta HCG (Qualitative)', category: 'Pregnancy', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Pregnancy detection test' },
  { name: 'Beta HCG (Quantitative)', category: 'Pregnancy', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Pregnancy hormone level measurement' },
  { name: 'Triple Marker Test', category: 'Pregnancy', price: 2000, sampleType: 'Blood', preparation: 'Fasting not required, 15-20 weeks', description: 'Down syndrome screening' },
  { name: 'Quadruple Marker Test', category: 'Pregnancy', price: 2500, sampleType: 'Blood', preparation: 'Fasting not required, 15-20 weeks', description: 'Enhanced Down syndrome screening' },

  // Bone Tests
  { name: 'Bone Profile', category: 'Bone Health', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Complete bone health panel' },
  { name: 'Calcium Total', category: 'Bone Health', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Total calcium level' },
  { name: 'Phosphorus', category: 'Bone Health', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Phosphorus level' },
  { name: 'Alkaline Phosphatase (Bone)', category: 'Bone Health', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Bone-specific alkaline phosphatase' },
  { name: 'PTH (Parathyroid Hormone)', category: 'Bone Health', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Parathyroid hormone level' },
  { name: '25-Hydroxyvitamin D', category: 'Bone Health', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vitamin D level for bone health' },

  // Pancreatic Tests
  { name: 'Amylase', category: 'Pancreas', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Amylase enzyme level' },
  { name: 'Lipase', category: 'Pancreas', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Lipase enzyme level' },
  { name: 'Pancreatic Elastase', category: 'Pancreas', price: 1500, sampleType: 'Stool', preparation: 'Fresh stool sample', description: 'Pancreatic function test' },

  // Inflammatory Markers
  { name: 'CRP (C-Reactive Protein)', category: 'Inflammatory', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'C-reactive protein for inflammation' },
  { name: 'ESR (Erythrocyte Sedimentation Rate)', category: 'Inflammatory', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'ESR for inflammation' },
  { name: 'Procalcitonin', category: 'Inflammatory', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Procalcitonin for bacterial infection' },
  { name: 'Interleukin-6 (IL-6)', category: 'Inflammatory', price: 2000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'IL-6 cytokine level' },

  // Serology Tests
  { name: 'ASO Titer (Anti-Streptolysin O)', category: 'Serology', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Streptococcal antibody test' },
  { name: 'RA Factor (Rheumatoid Factor)', category: 'Serology', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Rheumatoid arthritis marker' },
  { name: 'Anti-CCP', category: 'Serology', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Cyclic citrullinated peptide antibody' },
  { name: 'Anti-MCV', category: 'Serology', price: 1200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anti-mutated citrullinated vimentin' },

  // Specialized Tests
  { name: 'Hb Electrophoresis', category: 'Hematology', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Hemoglobin variant analysis' },
  { name: 'G6PD (Glucose-6-Phosphate Dehydrogenase)', category: 'Hematology', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'G6PD enzyme deficiency test' },
  { name: 'Sickle Cell Test', category: 'Hematology', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Sickle cell anemia detection' },
  { name: 'Thalassemia Screening', category: 'Hematology', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Thalassemia carrier screening' },
  { name: 'Hemoglobin A1c', category: 'Diabetes', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: '3-month average blood sugar' },
  { name: 'Fructosamine', category: 'Diabetes', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: '2-3 week average blood sugar' },
  { name: 'Insulin Resistance (HOMA-IR)', category: 'Diabetes', price: 800, sampleType: 'Blood', preparation: 'Fasting 10-12 hours required', description: 'Insulin resistance calculation' },

  // Additional Common Tests
  { name: 'Blood Group & Rh Factor', category: 'Blood Group', price: 200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'ABO and Rh blood typing' },
  { name: 'Cross Matching', category: 'Blood Group', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood compatibility test' },
  { name: 'Direct Coombs Test', category: 'Blood Group', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Direct antiglobulin test' },
  { name: 'Indirect Coombs Test', category: 'Blood Group', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Indirect antiglobulin test' },
  { name: 'Reticulocyte Count', category: 'Hematology', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Reticulocyte count for bone marrow function' },
  { name: 'Osmolality', category: 'Electrolytes', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood osmolality measurement' },
  { name: 'Anion Gap', category: 'Electrolytes', price: 150, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Anion gap calculation' },
  { name: 'Lactate Dehydrogenase (LDH)', category: 'General', price: 300, sampleType: 'Blood', preparation: 'Fasting not required', description: 'LDH enzyme level' },
  { name: 'CPK (Creatine Phosphokinase)', category: 'Muscle', price: 400, sampleType: 'Blood', preparation: 'Fasting not required', description: 'CPK for muscle damage' },
  { name: 'Myoglobin', category: 'Muscle', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Myoglobin for muscle injury' },
  { name: 'Aldolase', category: 'Muscle', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Aldolase enzyme level' },
  { name: 'Lactate (Lactic Acid)', category: 'Metabolic', price: 500, sampleType: 'Blood', preparation: 'Fasting not required, avoid exercise', description: 'Lactate level' },
  { name: 'Pyruvate', category: 'Metabolic', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Pyruvate level' },
  { name: 'Ammonia', category: 'Metabolic', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood ammonia level' },
  { name: 'Ceruloplasmin', category: 'Metabolic', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Ceruloplasmin level' },
  { name: 'Copper', category: 'Metabolic', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Copper level' },
  { name: 'Zinc', category: 'Metabolic', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Zinc level' },
  { name: 'Selenium', category: 'Metabolic', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Selenium level' },
  { name: 'Chromium', category: 'Metabolic', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Chromium level' },
  { name: 'Manganese', category: 'Metabolic', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Manganese level' },
  { name: 'Lead', category: 'Toxicology', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood lead level' },
  { name: 'Mercury', category: 'Toxicology', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood mercury level' },
  { name: 'Arsenic', category: 'Toxicology', price: 1200, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood arsenic level' },
  { name: 'Cadmium', category: 'Toxicology', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood cadmium level' },
  { name: 'Lithium', category: 'Toxicology', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood lithium level' },
  { name: 'Ethanol (Alcohol)', category: 'Toxicology', price: 500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood alcohol level' },
  { name: 'Methanol', category: 'Toxicology', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood methanol level' },
  { name: 'Salicylate', category: 'Toxicology', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood salicylate level' },
  { name: 'Paracetamol (Acetaminophen)', category: 'Toxicology', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Blood paracetamol level' },
  { name: 'Theophylline', category: 'Therapeutic Drug', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Theophylline drug level' },
  { name: 'Phenytoin', category: 'Therapeutic Drug', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Phenytoin drug level' },
  { name: 'Carbamazepine', category: 'Therapeutic Drug', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Carbamazepine drug level' },
  { name: 'Valproic Acid', category: 'Therapeutic Drug', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Valproic acid drug level' },
  { name: 'Digoxin', category: 'Therapeutic Drug', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Digoxin drug level' },
  { name: 'Warfarin', category: 'Therapeutic Drug', price: 600, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Warfarin drug level' },
  { name: 'Vancomycin', category: 'Therapeutic Drug', price: 1000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vancomycin drug level' },
  { name: 'Gentamicin', category: 'Therapeutic Drug', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Gentamicin drug level' },
  { name: 'Tacrolimus', category: 'Therapeutic Drug', price: 2000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Tacrolimus drug level' },
  { name: 'Cyclosporine', category: 'Therapeutic Drug', price: 2000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Cyclosporine drug level' },
  { name: 'Mycophenolic Acid', category: 'Therapeutic Drug', price: 2500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Mycophenolic acid drug level' },
  { name: 'Sirolimus', category: 'Therapeutic Drug', price: 2500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Sirolimus drug level' },
  { name: 'Everolimus', category: 'Therapeutic Drug', price: 2500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Everolimus drug level' },
  { name: 'Methotrexate', category: 'Therapeutic Drug', price: 800, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Methotrexate drug level' },
  { name: '5-Fluorouracil', category: 'Therapeutic Drug', price: 1500, sampleType: 'Blood', preparation: 'Fasting not required', description: '5-FU drug level' },
  { name: 'Imatinib', category: 'Therapeutic Drug', price: 3000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Imatinib drug level' },
  { name: 'Erlotinib', category: 'Therapeutic Drug', price: 3000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Erlotinib drug level' },
  { name: 'Gefitinib', category: 'Therapeutic Drug', price: 3000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Gefitinib drug level' },
  { name: 'Sunitinib', category: 'Therapeutic Drug', price: 3500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Sunitinib drug level' },
  { name: 'Sorafenib', category: 'Therapeutic Drug', price: 3500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Sorafenib drug level' },
  { name: 'Pazopanib', category: 'Therapeutic Drug', price: 3500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Pazopanib drug level' },
  { name: 'Axitinib', category: 'Therapeutic Drug', price: 3500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Axitinib drug level' },
  { name: 'Cabozantinib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Cabozantinib drug level' },
  { name: 'Lenvatinib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Lenvatinib drug level' },
  { name: 'Regorafenib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Regorafenib drug level' },
  { name: 'Vandetanib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Vandetanib drug level' },
  { name: 'Nilotinib', category: 'Therapeutic Drug', price: 3500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Nilotinib drug level' },
  { name: 'Dasatinib', category: 'Therapeutic Drug', price: 3500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Dasatinib drug level' },
  { name: 'Bosutinib', category: 'Therapeutic Drug', price: 3500, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Bosutinib drug level' },
  { name: 'Ponatinib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Ponatinib drug level' },
  { name: 'Ibrutinib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Ibrutinib drug level' },
  { name: 'Acalabrutinib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Acalabrutinib drug level' },
  { name: 'Zanubrutinib', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Zanubrutinib drug level' },
  { name: 'Venetoclax', category: 'Therapeutic Drug', price: 4000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Venetoclax drug level' },
  { name: 'Rituximab Level', category: 'Therapeutic Drug', price: 5000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Rituximab drug level' },
  { name: 'Trastuzumab Level', category: 'Therapeutic Drug', price: 5000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Trastuzumab drug level' },
  { name: 'Bevacizumab Level', category: 'Therapeutic Drug', price: 5000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Bevacizumab drug level' },
  { name: 'Cetuximab Level', category: 'Therapeutic Drug', price: 5000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Cetuximab drug level' },
  { name: 'Panitumumab Level', category: 'Therapeutic Drug', price: 5000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Panitumumab drug level' },
  { name: 'Pembrolizumab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Pembrolizumab drug level' },
  { name: 'Nivolumab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Nivolumab drug level' },
  { name: 'Atezolizumab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Atezolizumab drug level' },
  { name: 'Durvalumab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Durvalumab drug level' },
  { name: 'Avelumab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Avelumab drug level' },
  { name: 'Cemiplimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Cemiplimab drug level' },
  { name: 'Dostarlimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Dostarlimab drug level' },
  { name: 'Relatlimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Relatlimab drug level' },
  { name: 'Tislelizumab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Tislelizumab drug level' },
  { name: 'Sintilimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Sintilimab drug level' },
  { name: 'Camrelizumab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Camrelizumab drug level' },
  { name: 'Toripalimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Toripalimab drug level' },
  { name: 'Penpulimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Penpulimab drug level' },
  { name: 'Zimberelimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Zimberelimab drug level' },
  { name: 'Geptanolimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Geptanolimab drug level' },
  { name: 'Serplulimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Serplulimab drug level' },
  { name: 'Envafolimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Envafolimab drug level' },
  { name: 'Cadonilimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Cadonilimab drug level' },
  { name: 'Adebrelimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Adebrelimab drug level' },
  { name: 'Sugemalimab Level', category: 'Therapeutic Drug', price: 6000, sampleType: 'Blood', preparation: 'Fasting not required', description: 'Sugemalimab drug level' },
];

const seedTests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/lab-booking');
    console.log('Connected to MongoDB');

    // Remove duplicates based on test name
    const uniqueTests = [];
    const seenNames = new Set();
    
    for (const test of tests) {
      if (!seenNames.has(test.name)) {
        seenNames.add(test.name);
        uniqueTests.push(test);
      }
    }

    console.log(`Total unique tests: ${uniqueTests.length}`);

    // Clear existing tests
    await Test.deleteMany({});
    console.log('Cleared existing tests');

    // Limit to 250 tests if we have more
    const testsToInsert = uniqueTests.slice(0, 250);
    
    // Insert tests
    const inserted = await Test.insertMany(testsToInsert);
    console.log(`✅ Successfully seeded ${inserted.length} tests!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding tests:', error);
    process.exit(1);
  }
};

seedTests();

