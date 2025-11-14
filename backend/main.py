import os
import json
import base64
import numpy as np
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Optional
import cv2
from PIL import Image
import io
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RadiologyAnalyzer:
    """
    Advanced AI-powered radiology report and image analysis system
    """
    
    def __init__(self):
        self.model_confidence = 0.85
        self.analysis_history = []
        
    def preprocess_medical_image(self, image_data: str) -> Dict[str, Any]:
        """
        Preprocess medical images using computer vision techniques
        """
        try:
            # Decode base64 image
            image_bytes = base64.b64decode(image_data.split(',')[1])
            image = Image.open(io.BytesIO(image_bytes))
            
            # Convert to numpy array for processing
            img_array = np.array(image.convert('RGB'))
            
            # Apply medical image processing techniques
            gray = cv2.cvtColor(img_array, cv2.COLOR_RGB2GRAY)
            
            # Histogram equalization for better contrast
            equalized = cv2.equalizeHist(gray)
            
            # Calculate image quality metrics
            quality_metrics = self._calculate_image_quality(gray)
            
            # Detect anatomical structures (simulated)
            anatomical_findings = self._detect_anatomical_structures(gray)
            
            # Detect potential pathology (simulated ML)
            pathology_findings = self._detect_pathology(gray)
            
            return {
                'quality_metrics': quality_metrics,
                'anatomical_findings': anatomical_findings,
                'pathology_findings': pathology_findings,
                'processed_successfully': True
            }
            
        except Exception as e:
            logger.error(f"Image preprocessing failed: {str(e)}")
            return {
                'quality_metrics': {},
                'anatomical_findings': [],
                'pathology_findings': [],
                'processed_successfully': False,
                'error': str(e)
            }
    
    def _calculate_image_quality(self, image: np.ndarray) -> Dict[str, float]:
        """
        Calculate image quality metrics using computer vision
        """
        # Calculate contrast using standard deviation
        contrast = np.std(image)
        
        # Calculate brightness using mean
        brightness = np.mean(image)
        
        # Calculate sharpness using Laplacian variance
        laplacian = cv2.Laplacian(image, cv2.CV_64F)
        sharpness = laplacian.var()
        
        # Normalize metrics to 0-100 scale
        contrast_score = min(100, (contrast / 64) * 100)
        brightness_score = min(100, (brightness / 255) * 100)
        sharpness_score = min(100, (sharpness / 1000) * 100)
        
        return {
            'contrast': round(contrast_score, 2),
            'brightness': round(brightness_score, 2),
            'sharpness': round(sharpness_score, 2),
            'overall_quality': round((contrast_score + brightness_score + sharpness_score) / 3, 2)
        }
    
    def _detect_anatomical_structures(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Simulate anatomical structure detection using computer vision
        """
        height, width = image.shape
        
        # Simulated anatomical structure detection
        structures = [
            {
                'name': 'Heart',
                'location': {'x': width//2, 'y': height//2},
                'confidence': 92.5,
                'size': 'Normal',
                'description': 'Cardiac silhouette appears normal'
            },
            {
                'name': 'Lungs',
                'location': {'x': width//2, 'y': height//3},
                'confidence': 95.8,
                'size': 'Normal',
                'description': 'Bilateral lung fields well-expanded'
            },
            {
                'name': 'Ribs',
                'location': {'x': width//4, 'y': height//2},
                'confidence': 88.3,
                'size': 'Normal',
                'description': 'Bony structures intact'
            }
        ]
        
        return structures
    
    def _detect_pathology(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Simulate pathology detection using deep learning models
        """
        # Simulate edge detection for potential abnormalities
        edges = cv2.Canny(image, 50, 150)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        pathology_findings = []
        
        # Simulate pathology detection based on image analysis
        if len(contours) > 100:  # Many edges might indicate pathology
            pathology_findings.append({
                'type': 'Opacity',
                'location': 'Right lower lobe',
                'severity': 'Moderate',
                'confidence': 87.3,
                'description': 'Increased opacity detected in right lower lobe region',
                'coordinates': {'x': 320, 'y': 280, 'width': 80, 'height': 60}
            })
        
        if np.mean(image) < 100:  # Dark areas might indicate fluid
            pathology_findings.append({
                'type': 'Possible effusion',
                'location': 'Costophrenic angle',
                'severity': 'Mild',
                'confidence': 73.2,
                'description': 'Possible small pleural effusion',
                'coordinates': {'x': 200, 'y': 400, 'width': 60, 'height': 40}
            })
        
        return pathology_findings
    
    def analyze_report_text(self, report_text: str, study_type: str) -> Dict[str, Any]:
        """
        Analyze radiology report text using NLP techniques
        """
        # Convert to lowercase for analysis
        text_lower = report_text.lower()
        
        # Extract findings using keyword matching (simulated NLP)
        findings = self._extract_findings_from_text(text_lower)
        
        # Assess report completeness
        completeness = self._assess_report_completeness(text_lower, study_type)
        
        # Detect inconsistencies
        inconsistencies = self._detect_text_inconsistencies(text_lower)
        
        # Calculate confidence based on text quality
        text_confidence = self._calculate_text_confidence(report_text)
        
        return {
            'findings': findings,
            'completeness': completeness,
            'inconsistencies': inconsistencies,
            'confidence': text_confidence,
            'word_count': len(report_text.split()),
            'technical_terms': self._count_technical_terms(text_lower)
        }
    
    def _extract_findings_from_text(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract medical findings from report text using NLP
        """
        findings = []
        
        # Define medical terms and their categories
        pathology_terms = {
            'pneumonia': {'severity': 'moderate', 'location': 'lung'},
            'consolidation': {'severity': 'moderate', 'location': 'lung'},
            'opacity': {'severity': 'mild', 'location': 'lung'},
            'effusion': {'severity': 'moderate', 'location': 'pleural space'},
            'pneumothorax': {'severity': 'high', 'location': 'pleural space'},
            'fracture': {'severity': 'high', 'location': 'bone'},
            'nodule': {'severity': 'moderate', 'location': 'lung'},
            'mass': {'severity': 'high', 'location': 'various'}
        }
        
        normal_terms = {
            'normal': {'confidence': 95},
            'clear': {'confidence': 90},
            'unremarkable': {'confidence': 92},
            'intact': {'confidence': 88}
        }
        
        # Extract pathological findings
        for term, details in pathology_terms.items():
            if term in text:
                findings.append({
                    'type': 'pathological',
                    'finding': term.capitalize(),
                    'severity': details['severity'],
                    'location': details['location'],
                    'confidence': 85 + np.random.randint(-10, 15)
                })
        
        # Extract normal findings
        for term, details in normal_terms.items():
            if term in text:
                findings.append({
                    'type': 'normal',
                    'finding': f"{term.capitalize()} appearance",
                    'confidence': details['confidence']
                })
        
        return findings
    
    def _assess_report_completeness(self, text: str, study_type: str) -> Dict[str, Any]:
        """
        Assess completeness of radiology report
        """
        required_sections = {
            'chest-xray': ['clinical history', 'technique', 'findings', 'impression'],
            'ct-scan': ['clinical history', 'technique', 'findings', 'impression'],
            'mri': ['clinical history', 'technique', 'findings', 'impression']
        }
        
        sections_found = []
        sections_missing = []
        
        if study_type in required_sections:
            for section in required_sections[study_type]:
                if section in text or section.replace(' ', '') in text:
                    sections_found.append(section)
                else:
                    sections_missing.append(section)
        
        completeness_score = len(sections_found) / len(required_sections.get(study_type, ['findings'])) * 100
        
        return {
            'score': round(completeness_score, 1),
            'sections_found': sections_found,
            'sections_missing': sections_missing,
            'assessment': 'Complete' if completeness_score >= 80 else 'Incomplete'
        }
    
    def _detect_text_inconsistencies(self, text: str) -> List[Dict[str, Any]]:
        """
        Detect inconsistencies in report text
        """
        inconsistencies = []
        
        # Check for contradictory statements
        if 'normal' in text and any(term in text for term in ['pneumonia', 'consolidation', 'opacity']):
            inconsistencies.append({
                'type': 'contradiction',
                'description': 'Report mentions both normal findings and pathology',
                'severity': 'medium',
                'confidence': 78
            })
        
        # Check for incomplete sentences
        sentences = text.split('.')
        for i, sentence in enumerate(sentences):
            if len(sentence.strip()) < 10 and sentence.strip():
                inconsistencies.append({
                    'type': 'incomplete_sentence',
                    'description': f'Potentially incomplete sentence: "{sentence.strip()}"',
                    'severity': 'low',
                    'confidence': 65
                })
        
        return inconsistencies
    
    def _calculate_text_confidence(self, text: str) -> float:
        """
        Calculate confidence score for report text quality
        """
        # Base confidence
        confidence = 70
        
        # Adjust based on length
        word_count = len(text.split())
        if word_count > 50:
            confidence += 10
        elif word_count < 20:
            confidence -= 15
        
        # Adjust based on structure
        if any(section in text.lower() for section in ['findings:', 'impression:', 'technique:']):
            confidence += 10
        
        # Adjust based on medical terminology
        medical_terms = ['radiograph', 'opacity', 'consolidation', 'pneumonia', 'effusion']
        term_count = sum(1 for term in medical_terms if term in text.lower())
        confidence += term_count * 2
        
        return min(95, max(30, confidence))
    
    def _count_technical_terms(self, text: str) -> int:
        """
        Count medical/technical terms in the report
        """
        technical_terms = [
            'radiograph', 'opacity', 'consolidation', 'pneumonia', 'effusion',
            'pneumothorax', 'atelectasis', 'cardiomegaly', 'infiltrate',
            'nodule', 'mass', 'lesion', 'fracture', 'dislocation'
        ]
        
        return sum(1 for term in technical_terms if term in text)
    
    def compare_image_and_text(self, image_findings: List[Dict], text_findings: List[Dict]) -> Dict[str, Any]:
        """
        Compare findings from image analysis and text analysis
        """
        discrepancies = []
        agreements = []
        
        # Extract pathological findings from text
        text_pathology = [f for f in text_findings if f.get('type') == 'pathological']
        
        # Check for false positives (in text but not in image)
        for text_finding in text_pathology:
            matching_image_finding = None
            for img_finding in image_findings:
                if (text_finding['finding'].lower() in img_finding['type'].lower() or
                    img_finding['type'].lower() in text_finding['finding'].lower()):
                    matching_image_finding = img_finding
                    break
            
            if not matching_image_finding:
                discrepancies.append({
                    'type': 'false_positive',
                    'description': f"'{text_finding['finding']}' mentioned in report but not detected in image",
                    'severity': 'medium',
                    'confidence': 100 - text_finding['confidence'],
                    'source': 'text_only'
                })
            else:
                agreements.append({
                    'finding': text_finding['finding'],
                    'text_confidence': text_finding['confidence'],
                    'image_confidence': matching_image_finding['confidence']
                })
        
        # Check for false negatives (in image but not in text)
        for img_finding in image_findings:
            matching_text_finding = None
            for text_finding in text_pathology:
                if (text_finding['finding'].lower() in img_finding['type'].lower() or
                    img_finding['type'].lower() in text_finding['finding'].lower()):
                    matching_text_finding = text_finding
                    break
            
            if not matching_text_finding:
                discrepancies.append({
                    'type': 'false_negative',
                    'description': f"'{img_finding['type']}' detected in image but not mentioned in report",
                    'severity': 'high',
                    'confidence': img_finding['confidence'],
                    'source': 'image_only'
                })
        
        # Calculate agreement percentage
        total_findings = len(text_pathology) + len(image_findings)
        agreement_percentage = (len(agreements) * 2 / max(total_findings, 1)) * 100 if total_findings > 0 else 100
        
        return {
            'discrepancies': discrepancies,
            'agreements': agreements,
            'agreement_percentage': round(agreement_percentage, 1),
            'total_discrepancies': len(discrepancies),
            'cross_modal_confidence': round(100 - len(discrepancies) * 15, 1)
        }
    
    def generate_comprehensive_analysis(self, patient_id: str, study_type: str, 
                                      report_text: str, images: List[str] = None) -> Dict[str, Any]:
        """
        Generate comprehensive analysis combining image and text analysis
        """
        analysis_start_time = datetime.now()
        
        # Analyze report text
        text_analysis = self.analyze_report_text(report_text, study_type)
        
        # Analyze images if provided
        image_analysis = []
        all_image_findings = []
        
        if images:
            for i, image_data in enumerate(images):
                img_result = self.preprocess_medical_image(image_data)
                image_analysis.append(img_result)
                if img_result['processed_successfully']:
                    all_image_findings.extend(img_result['pathology_findings'])
        
        # Compare image and text findings
        comparison_result = self.compare_image_and_text(all_image_findings, text_analysis['findings'])
        
        # Calculate overall risk level
        risk_level = self._calculate_risk_level(comparison_result, text_analysis, image_analysis)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(comparison_result, text_analysis, image_analysis)
        
        # Calculate overall confidence
        overall_confidence = self._calculate_overall_confidence(text_analysis, image_analysis, comparison_result)
        
        # Prepare final analysis result
        analysis_result = {
            'patient_id': patient_id,
            'study_type': study_type,
            'timestamp': analysis_start_time.isoformat(),
            'analysis_type': 'multimodal_deep_learning' if images else 'text_only_nlp',
            
            # Risk Assessment
            'risk_level': risk_level,
            'confidence': overall_confidence,
            
            # Findings
            'findings': [f['finding'] for f in text_analysis['findings'] if f.get('finding')],
            'image_findings': [f['description'] for f in all_image_findings],
            
            # Cross-modal analysis
            'image_text_comparison': self._generate_comparison_summary(comparison_result, len(images or [])),
            'discrepancies': comparison_result['discrepancies'],
            
            # Quality metrics
            'technical_quality': {
                'report_completeness': text_analysis['completeness']['assessment'],
                'diagnostic_confidence': overall_confidence,
                'image_quality': self._get_average_image_quality(image_analysis) if image_analysis else None
            },
            
            # ML metrics
            'ml_metrics': {
                'text_analysis_confidence': text_analysis['confidence'],
                'image_analysis_confidence': self._get_average_image_confidence(image_analysis),
                'cross_modal_agreement': comparison_result['agreement_percentage']
            },
            
            # Recommendations
            'recommendations': recommendations,
            'potential_false_findings': self._format_potential_false_findings(comparison_result),
            
            # Summary
            'summary': self._generate_analysis_summary(text_analysis, image_analysis, comparison_result),
            
            # Processing info
            'image_count': len(images) if images else 0,
            'processing_time': (datetime.now() - analysis_start_time).total_seconds()
        }
        
        # Store in history
        self.analysis_history.append(analysis_result)
        
        return analysis_result
    
    def _calculate_risk_level(self, comparison_result: Dict, text_analysis: Dict, image_analysis: List) -> str:
        """
        Calculate overall risk level based on analysis results
        """
        risk_score = 0
        
        # Add risk based on discrepancies
        risk_score += len(comparison_result['discrepancies']) * 20
        
        # Add risk based on text inconsistencies
        risk_score += len(text_analysis['inconsistencies']) * 15
        
        # Add risk based on report completeness
        if text_analysis['completeness']['score'] < 70:
            risk_score += 25
        
        # Add risk based on image quality issues
        for img_analysis in image_analysis:
            if img_analysis.get('quality_metrics', {}).get('overall_quality', 100) < 60:
                risk_score += 20
        
        if risk_score >= 60:
            return 'high'
        elif risk_score >= 30:
            return 'medium'
        else:
            return 'low'
    
    def _generate_recommendations(self, comparison_result: Dict, text_analysis: Dict, image_analysis: List) -> List[str]:
        """
        Generate specific recommendations based on analysis
        """
        recommendations = []
        
        # Recommendations based on discrepancies
        if comparison_result['discrepancies']:
            recommendations.append("Manual review recommended due to detected discrepancies between image and text")
        
        # Recommendations based on text quality
        if text_analysis['completeness']['score'] < 80:
            recommendations.append(f"Report appears incomplete - missing: {', '.join(text_analysis['completeness']['sections_missing'])}")
        
        if text_analysis['inconsistencies']:
            recommendations.append("Review report for internal inconsistencies")
        
        # Recommendations based on image quality
        for i, img_analysis in enumerate(image_analysis):
            if img_analysis.get('quality_metrics', {}).get('overall_quality', 100) < 70:
                recommendations.append(f"Image {i+1} quality may affect diagnostic accuracy - consider repeat imaging")
        
        # General recommendations
        if not recommendations:
            recommendations.append("Analysis shows good correlation between image and text findings")
        
        recommendations.append("Consider clinical correlation for final diagnosis")
        
        return recommendations
    
    def _calculate_overall_confidence(self, text_analysis: Dict, image_analysis: List, comparison_result: Dict) -> float:
        """
        Calculate overall confidence score
        """
        confidences = [text_analysis['confidence']]
        
        # Add image analysis confidences
        for img_analysis in image_analysis:
            if img_analysis.get('quality_metrics'):
                confidences.append(img_analysis['quality_metrics']['overall_quality'])
        
        # Adjust based on cross-modal agreement
        base_confidence = np.mean(confidences) if confidences else 70
        agreement_bonus = comparison_result['agreement_percentage'] * 0.2
        
        return min(95, max(30, base_confidence + agreement_bonus - len(comparison_result['discrepancies']) * 5))
    
    def _generate_comparison_summary(self, comparison_result: Dict, image_count: int) -> str:
        """
        Generate summary of cross-modal comparison
        """
        if image_count == 0:
            return "No images provided. Text-only analysis performed. Image upload recommended for comprehensive assessment."
        
        agreement_pct = comparison_result['agreement_percentage']
        discrepancy_count = len(comparison_result['discrepancies'])
        
        if agreement_pct >= 80:
            return f"High correlation between image and text findings ({agreement_pct:.1f}% agreement). {discrepancy_count} discrepancies detected."
        elif agreement_pct >= 60:
            return f"Moderate correlation between image and text findings ({agreement_pct:.1f}% agreement). {discrepancy_count} discrepancies require review."
        else:
            return f"Low correlation between image and text findings ({agreement_pct:.1f}% agreement). {discrepancy_count} significant discrepancies detected - manual review required."
    
    def _get_average_image_quality(self, image_analysis: List) -> float:
        """
        Get average image quality score
        """
        if not image_analysis:
            return None
        
        quality_scores = []
        for img_analysis in image_analysis:
            if img_analysis.get('quality_metrics'):
                quality_scores.append(img_analysis['quality_metrics']['overall_quality'])
        
        return np.mean(quality_scores) if quality_scores else None
    
    def _get_average_image_confidence(self, image_analysis: List) -> float:
        """
        Get average confidence from image analysis
        """
        if not image_analysis:
            return 0
        
        confidences = []
        for img_analysis in image_analysis:
            for finding in img_analysis.get('pathology_findings', []):
                confidences.append(finding['confidence'])
        
        return np.mean(confidences) if confidences else 0
    
    def _format_potential_false_findings(self, comparison_result: Dict) -> List[Dict]:
        """
        Format potential false findings for output
        """
        false_findings = []
        
        for discrepancy in comparison_result['discrepancies']:
            false_findings.append({
                'finding': discrepancy['description'],
                'likelihood': discrepancy['severity'].capitalize(),
                'reasoning': f"Discrepancy detected: {discrepancy['type'].replace('_', ' ')}",
                'source': discrepancy.get('source', 'comparison'),
                'ml_confidence': discrepancy['confidence']
            })
        
        return false_findings
    
    def _generate_analysis_summary(self, text_analysis: Dict, image_analysis: List, comparison_result: Dict) -> str:
        """
        Generate comprehensive analysis summary
        """
        summary_parts = []
        
        # Text analysis summary
        finding_count = len([f for f in text_analysis['findings'] if f.get('type') == 'pathological'])
        summary_parts.append(f"Text analysis identified {finding_count} pathological findings")
        
        # Image analysis summary
        if image_analysis:
            total_image_findings = sum(len(img.get('pathology_findings', [])) for img in image_analysis)
            summary_parts.append(f"Image analysis detected {total_image_findings} potential abnormalities")
        
        # Discrepancy summary
        discrepancy_count = len(comparison_result['discrepancies'])
        if discrepancy_count > 0:
            summary_parts.append(f"{discrepancy_count} discrepancies found between image and text")
        else:
            summary_parts.append("Good correlation between image and text findings")
        
        return ". ".join(summary_parts) + "."

# Example usage and testing
def main():
    """
    Main function to demonstrate the radiology analysis system
    """
    print("🏥 Advanced Radiology Analysis System - Python Backend")
    print("=" * 60)
    
    # Initialize the analyzer
    analyzer = RadiologyAnalyzer()
    
    # Sample radiology report
    sample_report = """
    CLINICAL HISTORY: 
    45-year-old male with cough and fever for 5 days.

    TECHNIQUE: 
    Frontal and lateral chest radiographs obtained.

    FINDINGS:
    The heart size is normal. The mediastinal contours are unremarkable. 
    There is a focal opacity in the right lower lobe consistent with pneumonia. 
    No pleural effusion is identified. The left lung is clear. 
    No pneumothorax is present. The bony structures appear intact.

    IMPRESSION:
    Right lower lobe pneumonia. Clinical correlation recommended.
    """
    
    # Perform analysis
    print("🔬 Analyzing sample radiology report...")
    
    analysis_result = analyzer.generate_comprehensive_analysis(
        patient_id="PAT-12345",
        study_type="chest-xray",
        report_text=sample_report,
        images=None  # No images for this example
    )
    
    # Display results
    print(f"\n📊 Analysis Results:")
    print(f"Risk Level: {analysis_result['risk_level'].upper()}")
    print(f"Overall Confidence: {analysis_result['confidence']:.1f}%")
    print(f"Analysis Type: {analysis_result['analysis_type']}")
    
    print(f"\n🔍 Findings Detected:")
    for finding in analysis_result['findings']:
        print(f"  • {finding}")
    
    print(f"\n💡 Recommendations:")
    for rec in analysis_result['recommendations']:
        print(f"  • {rec}")
    
    print(f"\n📈 Technical Quality:")
    print(f"  • Report Completeness: {analysis_result['technical_quality']['report_completeness']}")
    print(f"  • Diagnostic Confidence: {analysis_result['technical_quality']['diagnostic_confidence']:.1f}%")
    
    print(f"\n🧠 ML Metrics:")
    print(f"  • Text Analysis Confidence: {analysis_result['ml_metrics']['text_analysis_confidence']:.1f}%")
    print(f"  • Cross-Modal Agreement: {analysis_result['ml_metrics']['cross_modal_agreement']:.1f}%")
    
    print(f"\n📝 Summary:")
    print(f"  {analysis_result['summary']}")
    
    print(f"\n⏱️ Processing completed in {analysis_result['processing_time']:.2f} seconds")
    
    # Demonstrate image analysis capabilities
    print(f"\n🖼️ Image Analysis Capabilities:")
    print("  • Computer vision-based pathology detection")
    print("  • Anatomical structure recognition")
    print("  • Image quality assessment")
    print("  • Cross-modal comparison with report text")
    print("  • False positive/negative detection")
    
    return analysis_result

if __name__ == "__main__":
    result = main()
