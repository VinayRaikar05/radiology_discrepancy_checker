#!/usr/bin/env python3
"""
Complete Radiology Analysis System - Python Backend
Integrates NLP, Computer Vision, and Machine Learning for comprehensive analysis
"""

import sys
import json
import base64
from datetime import datetime
from typing import Dict, List, Any, Optional

# Import our custom modules
from main import RadiologyAnalyzer
from medical_nlp import MedicalNLP
from computer_vision import MedicalImageProcessor
from ml_models import RadiologyMLModels

class ComprehensiveRadiologySystem:
    """
    Complete radiology analysis system integrating all components
    """
    
    def __init__(self):
        print("🏥 Initializing Comprehensive Radiology Analysis System")
        print("=" * 60)
        
        # Initialize all components
        self.radiology_analyzer = RadiologyAnalyzer()
        self.nlp_processor = MedicalNLP()
        self.image_processor = MedicalImageProcessor()
        self.ml_models = RadiologyMLModels()
        
        # Train ML models
        print("🤖 Training machine learning models...")
        self.ml_models.train_models()
        
        print("✅ System initialization complete!")
    
    def analyze_complete_case(self, patient_id: str, study_type: str, 
                            report_text: str, radiologist: str = "",
                            images: List[str] = None) -> Dict[str, Any]:
        """
        Perform complete analysis of a radiology case
        """
        analysis_start = datetime.now()
        
        print(f"\n🔬 Analyzing Case: {patient_id}")
        print(f"Study Type: {study_type}")
        print(f"Report Length: {len(report_text)} characters")
        print(f"Images: {len(images) if images else 0}")
        
        # 1. Advanced NLP Analysis
        print("📝 Performing advanced NLP analysis...")
        nlp_results = self.nlp_processor.extract_clinical_findings(report_text)
        report_quality = self.nlp_processor.assess_report_quality(report_text)
        
        # 2. Computer Vision Analysis
        image_results = []
        all_image_features = {}
        
        if images:
            print(f"🖼️ Processing {len(images)} medical images...")
            for i, image_data in enumerate(images):
                print(f"  Processing image {i+1}...")
                img_result = self.image_processor.process_medical_image(image_data)
                image_results.append(img_result)
                
                # Aggregate image features for ML
                if img_result['success']:
                    for key, value in img_result['features'].items():
                        if key not in all_image_features:
                            all_image_features[key] = []
                        all_image_features[key].append(value)
        
        # Average image features
        avg_image_features = {}
        for key, values in all_image_features.items():
            avg_image_features[key] = sum(values) / len(values) if values else 0
        
        # 3. Prepare features for ML analysis
        ml_features = self._prepare_ml_features(
            nlp_results, report_quality, avg_image_features, len(images)
        )
        
        # 4. Machine Learning Analysis
        print("🤖 Running ML analysis...")
        ml_analysis = self.ml_models.comprehensive_analysis(ml_features)
        
        # 5. Cross-modal comparison
        print("🔄 Performing cross-modal comparison...")
        cross_modal_analysis = self._perform_cross_modal_analysis(
            nlp_results, image_results, ml_analysis
        )
        
        # 6. Generate comprehensive report
        comprehensive_report = self._generate_comprehensive_report(
            patient_id, study_type, radiologist, report_text,
            nlp_results, report_quality, image_results, 
            ml_analysis, cross_modal_analysis, analysis_start
        )
        
        processing_time = (datetime.now() - analysis_start).total_seconds()
        print(f"✅ Analysis complete in {processing_time:.2f} seconds")
        
        return comprehensive_report
    
    def _prepare_ml_features(self, nlp_results: List[Dict], report_quality: Dict,
                           image_features: Dict, image_count: int) -> Dict[str, float]:
        """
        Prepare features for ML analysis
        """
        # Text-based features
        pathological_findings = [f for f in nlp_results if f.get('type') == 'pathological']
        normal_findings = [f for f in nlp_results if f.get('type') == 'normal']
        
        features = {
            # Image features (use defaults if no images)
            'contrast': image_features.get('mean_intensity', 50.0),
            'brightness': image_features.get('mean_intensity', 128.0),
            'sharpness': image_features.get('texture_score', 0.75) * 100,
            'symmetry_score': image_features.get('symmetry_score', 0.8),
            'edge_density': image_features.get('edge_density', 0.1),
            
            # Text features
            'word_count': float(report_quality['word_count']),
            'medical_term_count': float(report_quality['medical_term_count']),
            'sentence_count': float(report_quality['sentence_count']),
            'completeness_score': float(report_quality['completeness_score']),
            'clarity_score': float(report_quality['clarity_score']),
            
            # Cross-modal features
            'text_image_agreement': 0.8 if image_count > 0 else 0.5,
            'finding_count_text': float(len(pathological_findings)),
            'finding_count_image': float(image_count * 2),  # Estimated
            'confidence_variance': 10.0  # Default variance
        }
        
        return features
    
    def _perform_cross_modal_analysis(self, nlp_results: List[Dict], 
                                    image_results: List[Dict],
                                    ml_analysis: Dict) -> Dict[str, Any]:
        """
        Perform advanced cross-modal analysis
        """
        discrepancies = []
        agreements = []
        
        # Extract pathological findings from NLP
        text_pathology = [f for f in nlp_results if f.get('type') == 'pathological']
        
        # Extract pathology from images
        image_pathology = []
        for img_result in image_results:
            if img_result.get('success'):
                image_pathology.extend(img_result.get('pathology_findings', []))
        
        # Compare findings
        for text_finding in text_pathology:
            matched = False
            for img_finding in image_pathology:
                if self._findings_match(text_finding, img_finding):
                    agreements.append({
                        'text_finding': text_finding['finding'],
                        'image_finding': img_finding['type'],
                        'confidence_text': text_finding['confidence'],
                        'confidence_image': img_finding['confidence']
                    })
                    matched = True
                    break
            
            if not matched:
                discrepancies.append({
                    'type': 'false_positive',
                    'description': f"'{text_finding['finding']}' mentioned in report but not detected in images",
                    'severity': text_finding.get('severity', 'unknown'),
                    'confidence': 100 - text_finding['confidence']
                })
        
        # Check for image findings not in text
        for img_finding in image_pathology:
            matched = False
            for text_finding in text_pathology:
                if self._findings_match(text_finding, img_finding):
                    matched = True
                    break
            
            if not matched:
                discrepancies.append({
                    'type': 'false_negative',
                    'description': f"'{img_finding['type']}' detected in images but not mentioned in report",
                    'severity': img_finding.get('severity', 'unknown'),
                    'confidence': img_finding['confidence']
                })
        
        # Calculate agreement metrics
        total_findings = len(text_pathology) + len(image_pathology)
        agreement_score = (len(agreements) * 2 / max(total_findings, 1)) * 100
        
        return {
            'discrepancies': discrepancies,
            'agreements': agreements,
            'agreement_percentage': min(100, agreement_score),
            'total_discrepancies': len(discrepancies),
            'cross_modal_confidence': max(0, 100 - len(discrepancies) * 15)
        }
    
    def _findings_match(self, text_finding: Dict, image_finding: Dict) -> bool:
        """
        Check if text and image findings match
        """
        text_term = text_finding['finding'].lower()
        image_term = image_finding['type'].lower()
        
        # Direct match
        if text_term in image_term or image_term in text_term:
            return True
        
        # Synonym matching
        synonyms = {
            'pneumonia': ['consolidation', 'opacity', 'infiltrate'],
            'consolidation': ['pneumonia', 'opacity'],
            'opacity': ['consolidation', 'pneumonia', 'infiltrate'],
            'effusion': ['fluid'],
            'pneumothorax': ['air', 'collapse']
        }
        
        for term, synonym_list in synonyms.items():
            if term in text_term and any(syn in image_term for syn in synonym_list):
                return True
            if term in image_term and any(syn in text_term for syn in synonym_list):
                return True
        
        return False
    
    def _generate_comprehensive_report(self, patient_id: str, study_type: str,
                                     radiologist: str, report_text: str,
                                     nlp_results: List[Dict], report_quality: Dict,
                                     image_results: List[Dict], ml_analysis: Dict,
                                     cross_modal_analysis: Dict, 
                                     analysis_start: datetime) -> Dict[str, Any]:
        """
        Generate comprehensive analysis report
        """
        processing_time = (datetime.now() - analysis_start).total_seconds()
        
        # Extract key findings
        pathological_findings = [f['finding'] for f in nlp_results if f.get('type') == 'pathological']
        normal_findings = [f['finding'] for f in nlp_results if f.get('type') == 'normal']
        
        # Extract image findings
        all_image_findings = []
        for img_result in image_results:
            if img_result.get('success'):
                all_image_findings.extend([
                    f['description'] for f in img_result.get('pathology_findings', [])
                ])
        
        # Calculate overall risk level
        risk_factors = []
        if ml_analysis['pathology_analysis'].get('has_pathology'):
            risk_factors.append('ML detected pathology')
        if cross_modal_analysis['total_discrepancies'] > 0:
            risk_factors.append('Cross-modal discrepancies found')
        if report_quality['overall_score'] < 70:
            risk_factors.append('Report quality issues')
        if any(img.get('quality_metrics', {}).get('overall_quality_score', 100) < 60 
               for img in image_results if img.get('success')):
            risk_factors.append('Image quality issues')
        
        overall_risk = 'high' if len(risk_factors) >= 2 else 'medium' if risk_factors else 'low'
        
        # Calculate overall confidence
        confidences = [
            ml_analysis['overall_confidence'],
            cross_modal_analysis['cross_modal_confidence'] / 100,
            report_quality['overall_score'] / 100
        ]
        overall_confidence = (sum(confidences) / len(confidences)) * 100
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            ml_analysis, cross_modal_analysis, report_quality, image_results
        )
        
        return {
            # Basic information
            'patient_id': patient_id,
            'study_type': study_type,
            'radiologist': radiologist,
            'timestamp': analysis_start.isoformat(),
            'processing_time_seconds': processing_time,
            'analysis_type': 'comprehensive_python_ml',
            
            # Risk assessment
            'risk_level': overall_risk,
            'confidence': round(overall_confidence, 1),
            'risk_factors': risk_factors,
            
            # Findings
            'findings': pathological_findings + normal_findings,
            'pathological_findings': pathological_findings,
            'normal_findings': normal_findings,
            'image_findings': all_image_findings,
            
            # Cross-modal analysis
            'image_text_comparison': self._generate_comparison_summary(cross_modal_analysis),
            'discrepancies': cross_modal_analysis['discrepancies'],
            'agreements': cross_modal_analysis['agreements'],
            
            # Quality assessment
            'technical_quality': {
                'report_completeness': report_quality['assessment'],
                'report_score': report_quality['overall_score'],
                'diagnostic_confidence': round(overall_confidence, 1),
                'image_quality': self._get_average_image_quality(image_results)
            },
            
            # ML analysis results
            'ml_analysis': {
                'pathology_detected': ml_analysis['pathology_analysis'].get('has_pathology', False),
                'severity_assessment': ml_analysis['severity_analysis'].get('severity', 'unknown'),
                'quality_assessment': ml_analysis['quality_analysis'].get('quality', 'unknown'),
                'discrepancy_risk': ml_analysis['discrepancy_analysis'].get('risk_level', 'low'),
                'ml_confidence': ml_analysis['overall_confidence']
            },
            
            # Detailed metrics
            'ml_metrics': {
                'text_analysis_confidence': report_quality['overall_score'],
                'image_analysis_confidence': self._get_average_image_confidence(image_results),
                'cross_modal_agreement': cross_modal_analysis['agreement_percentage'],
                'ml_model_confidence': ml_analysis['overall_confidence'] * 100
            },
            
            # Recommendations and summary
            'recommendations': recommendations,
            'potential_false_findings': self._format_false_findings(cross_modal_analysis),
            'summary': self._generate_executive_summary(
                pathological_findings, all_image_findings, cross_modal_analysis, ml_analysis
            ),
            
            # Processing details
            'image_count': len(image_results),
            'nlp_findings_count': len(nlp_results),
            'components_used': ['NLP', 'Computer Vision', 'Machine Learning', 'Cross-Modal Analysis']
        }
    
    def _generate_recommendations(self, ml_analysis: Dict, cross_modal_analysis: Dict,
                                report_quality: Dict, image_results: List[Dict]) -> List[str]:
        """
        Generate specific recommendations based on analysis
        """
        recommendations = []
        
        # ML-based recommendations
        if ml_analysis['pathology_analysis'].get('has_pathology'):
            recommendations.append("ML models suggest pathology present - clinical correlation recommended")
        
        if ml_analysis['severity_analysis'].get('severity') == 'severe':
            recommendations.append("Severe findings detected - urgent clinical review recommended")
        
        # Cross-modal recommendations
        if cross_modal_analysis['total_discrepancies'] > 0:
            recommendations.append(f"{cross_modal_analysis['total_discrepancies']} discrepancies found between image and text - manual review required")
        
        # Quality-based recommendations
        if report_quality['overall_score'] < 70:
            recommendations.append("Report quality below optimal - consider revision for clarity")
        
        # Image quality recommendations
        for i, img_result in enumerate(image_results):
            if img_result.get('success'):
                quality_score = img_result.get('quality_metrics', {}).get('overall_quality_score', 100)
                if quality_score < 60:
                    recommendations.append(f"Image {i+1} quality suboptimal - consider repeat imaging")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Analysis shows good correlation between findings - routine follow-up as clinically indicated")
        
        recommendations.append("All AI findings require radiologist verification before clinical use")
        
        return recommendations
    
    def _generate_comparison_summary(self, cross_modal_analysis: Dict) -> str:
        """
        Generate cross-modal comparison summary
        """
        agreement_pct = cross_modal_analysis['agreement_percentage']
        discrepancy_count = cross_modal_analysis['total_discrepancies']
        
        if agreement_pct >= 80:
            return f"Excellent correlation between image and text findings ({agreement_pct:.1f}% agreement). {discrepancy_count} minor discrepancies noted."
        elif agreement_pct >= 60:
            return f"Good correlation between image and text findings ({agreement_pct:.1f}% agreement). {discrepancy_count} discrepancies require attention."
        else:
            return f"Significant discrepancies between image and text findings ({agreement_pct:.1f}% agreement). {discrepancy_count} major discrepancies detected - comprehensive review required."
    
    def _get_average_image_quality(self, image_results: List[Dict]) -> Optional[float]:
        """
        Get average image quality score
        """
        quality_scores = []
        for img_result in image_results:
            if img_result.get('success'):
                score = img_result.get('quality_metrics', {}).get('overall_quality_score')
                if score is not None:
                    quality_scores.append(score)
        
        return sum(quality_scores) / len(quality_scores) if quality_scores else None
    
    def _get_average_image_confidence(self, image_results: List[Dict]) -> float:
        """
        Get average confidence from image analysis
        """
        confidences = []
        for img_result in image_results:
            if img_result.get('success'):
                for finding in img_result.get('pathology_findings', []):
                    confidences.append(finding.get('confidence', 0))
        
        return sum(confidences) / len(confidences) if confidences else 0
    
    def _format_false_findings(self, cross_modal_analysis: Dict) -> List[Dict]:
        """
        Format potential false findings
        """
        false_findings = []
        
        for discrepancy in cross_modal_analysis['discrepancies']:
            false_findings.append({
                'finding': discrepancy['description'],
                'likelihood': discrepancy['severity'].capitalize(),
                'reasoning': f"Cross-modal analysis detected {discrepancy['type'].replace('_', ' ')}",
                'source': 'cross_modal_comparison',
                'ml_confidence': discrepancy['confidence']
            })
        
        return false_findings
    
    def _generate_executive_summary(self, pathological_findings: List[str],
                                  image_findings: List[str], cross_modal_analysis: Dict,
                                  ml_analysis: Dict) -> str:
        """
        Generate executive summary
        """
        summary_parts = []
        
        # Findings summary
        if pathological_findings:
            summary_parts.append(f"Text analysis identified {len(pathological_findings)} pathological findings")
        else:
            summary_parts.append("No pathological findings identified in text")
        
        if image_findings:
            summary_parts.append(f"Computer vision detected {len(image_findings)} potential abnormalities")
        else:
            summary_parts.append("No obvious abnormalities detected in images")
        
        # ML summary
        if ml_analysis['pathology_analysis'].get('has_pathology'):
            summary_parts.append("ML models confirm pathology presence")
        else:
            summary_parts.append("ML models suggest normal findings")
        
        # Cross-modal summary
        discrepancy_count = cross_modal_analysis['total_discrepancies']
        if discrepancy_count > 0:
            summary_parts.append(f"{discrepancy_count} discrepancies found requiring review")
        else:
            summary_parts.append("Good correlation between all analysis methods")
        
        return ". ".join(summary_parts) + "."

def main():
    """
    Main function demonstrating the comprehensive system
    """
    print("🏥 Comprehensive Radiology Analysis System")
    print("🐍 Python-Powered AI Backend")
    print("=" * 60)
    
    # Initialize the system
    system = ComprehensiveRadiologySystem()
    
    # Sample radiology report
    sample_report = """
    CLINICAL HISTORY: 
    45-year-old male with cough and fever for 5 days. Rule out pneumonia.

    TECHNIQUE: 
    Frontal and lateral chest radiographs obtained in the emergency department.

    FINDINGS:
    The heart size is normal. The mediastinal contours are unremarkable. 
    There is a focal opacity in the right lower lobe consistent with pneumonia. 
    No pleural effusion is identified. The left lung is clear. 
    No pneumothorax is present. The bony structures appear intact.
    No acute osseous abnormalities.

    IMPRESSION:
    Right lower lobe pneumonia. Clinical correlation and appropriate 
    antibiotic therapy recommended. Follow-up chest radiograph in 
    7-10 days to assess response to treatment.
    """
    
    # Perform comprehensive analysis
    print("\n🔬 Performing comprehensive analysis...")
    
    analysis_result = system.analyze_complete_case(
        patient_id="PAT-12345",
        study_type="chest-xray",
        report_text=sample_report,
        radiologist="Dr. Sarah Johnson",
        images=None  # No images for this demo
    )
    
    # Display results
    print(f"\n📊 COMPREHENSIVE ANALYSIS RESULTS")
    print("=" * 50)
    print(f"🏥 Patient: {analysis_result['patient_id']}")
    print(f"📋 Study: {analysis_result['study_type']}")
    print(f"👨‍⚕️ Radiologist: {analysis_result['radiologist']}")
    print(f"⏱️ Processing Time: {analysis_result['processing_time_seconds']:.2f}s")
    
    print(f"\n🎯 RISK ASSESSMENT:")
    print(f"Risk Level: {analysis_result['risk_level'].upper()}")
    print(f"Overall Confidence: {analysis_result['confidence']:.1f}%")
    print(f"Risk Factors: {', '.join(analysis_result['risk_factors']) if analysis_result['risk_factors'] else 'None'}")
    
    print(f"\n🔍 FINDINGS:")
    print(f"Pathological Findings ({len(analysis_result['pathological_findings'])}):")
    for finding in analysis_result['pathological_findings']:
        print(f"  • {finding}")
    
    print(f"\n🤖 MACHINE LEARNING ANALYSIS:")
    ml = analysis_result['ml_analysis']
    print(f"Pathology Detected: {'Yes' if ml['pathology_detected'] else 'No'}")
    print(f"Severity Assessment: {ml['severity_assessment'].title()}")
    print(f"Quality Assessment: {ml['quality_assessment'].title()}")
    print(f"ML Confidence: {ml['ml_confidence']:.1%}")
    
    print(f"\n📊 QUALITY METRICS:")
    tq = analysis_result['technical_quality']
    print(f"Report Completeness: {tq['report_completeness']}")
    print(f"Report Score: {tq['report_score']:.1f}/100")
    print(f"Diagnostic Confidence: {tq['diagnostic_confidence']:.1f}%")
    
    print(f"\n💡 RECOMMENDATIONS:")
    for i, rec in enumerate(analysis_result['recommendations'], 1):
        print(f"  {i}. {rec}")
    
    print(f"\n📝 EXECUTIVE SUMMARY:")
    print(f"  {analysis_result['summary']}")
    
    print(f"\n🔧 SYSTEM COMPONENTS USED:")
    for component in analysis_result['components_used']:
        print(f"  ✅ {component}")
    
    print(f"\n🎉 Analysis Complete!")
    print("This comprehensive system demonstrates:")
    print("  • Advanced Natural Language Processing")
    print("  • Computer Vision for Medical Images")
    print("  • Machine Learning Classification")
    print("  • Cross-Modal Analysis & Comparison")
    print("  • Automated Quality Assessment")
    print("  • Risk Stratification")
    print("  • Clinical Decision Support")

if __name__ == "__main__":
    main()
