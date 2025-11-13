import re
import nltk
import spacy
from typing import List, Dict, Any, Tuple
import numpy as np
from collections import Counter

# Download required NLTK data
try:
    nltk.download('punkt', quiet=True)
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
except:
    pass

class MedicalNLP:
    """
    Advanced Natural Language Processing for medical radiology reports
    """
    
    def __init__(self):
        # Medical terminology dictionaries
        self.pathology_keywords = {
            'pneumonia': {'severity': 'moderate', 'urgency': 'high', 'location': 'lung'},
            'consolidation': {'severity': 'moderate', 'urgency': 'medium', 'location': 'lung'},
            'opacity': {'severity': 'mild', 'urgency': 'low', 'location': 'lung'},
            'infiltrate': {'severity': 'moderate', 'urgency': 'medium', 'location': 'lung'},
            'effusion': {'severity': 'moderate', 'urgency': 'medium', 'location': 'pleural'},
            'pneumothorax': {'severity': 'high', 'urgency': 'high', 'location': 'pleural'},
            'fracture': {'severity': 'high', 'urgency': 'high', 'location': 'bone'},
            'dislocation': {'severity': 'high', 'urgency': 'high', 'location': 'joint'},
            'nodule': {'severity': 'moderate', 'urgency': 'medium', 'location': 'lung'},
            'mass': {'severity': 'high', 'urgency': 'high', 'location': 'various'},
            'lesion': {'severity': 'moderate', 'urgency': 'medium', 'location': 'various'},
            'cardiomegaly': {'severity': 'moderate', 'urgency': 'medium', 'location': 'heart'},
            'atelectasis': {'severity': 'mild', 'urgency': 'low', 'location': 'lung'}
        }
        
        self.normal_indicators = [
            'normal', 'unremarkable', 'clear', 'intact', 'stable', 
            'no acute', 'no evidence', 'negative', 'within normal limits'
        ]
        
        self.severity_modifiers = {
            'mild': 1, 'small': 1, 'minimal': 1, 'slight': 1,
            'moderate': 2, 'medium': 2,
            'severe': 3, 'large': 3, 'extensive': 3, 'massive': 3,
            'acute': 3, 'chronic': 2
        }
        
        self.anatomical_locations = [
            'right upper lobe', 'right middle lobe', 'right lower lobe',
            'left upper lobe', 'left lower lobe', 'bilateral',
            'heart', 'mediastinum', 'pleural', 'costophrenic',
            'hilum', 'apex', 'base', 'periphery'
        ]
    
    def extract_clinical_findings(self, text: str) -> List[Dict[str, Any]]:
        """
        Extract clinical findings using advanced NLP techniques
        """
        text_lower = text.lower()
        findings = []
        
        # Tokenize sentences
        sentences = self._split_into_sentences(text)
        
        for sentence in sentences:
            sentence_lower = sentence.lower()
            
            # Extract pathological findings
            pathology_findings = self._extract_pathology_from_sentence(sentence_lower)
            findings.extend(pathology_findings)
            
            # Extract normal findings
            normal_findings = self._extract_normal_findings(sentence_lower)
            findings.extend(normal_findings)
        
        # Remove duplicates and merge similar findings
        findings = self._merge_similar_findings(findings)
        
        return findings
    
    def _split_into_sentences(self, text: str) -> List[str]:
        """
        Split text into sentences using medical-aware tokenization
        """
        # Handle medical abbreviations that contain periods
        text = re.sub(r'\bDr\.', 'Dr', text)
        text = re.sub(r'\bMr\.', 'Mr', text)
        text = re.sub(r'\bMrs\.', 'Mrs', text)
        
        # Split on periods, but be careful with decimal numbers
        sentences = re.split(r'\.(?!\d)', text)
        
        # Clean up sentences
        sentences = [s.strip() for s in sentences if s.strip()]
        
        return sentences
    
    def _extract_pathology_from_sentence(self, sentence: str) -> List[Dict[str, Any]]:
        """
        Extract pathological findings from a single sentence
        """
        findings = []
        
        for pathology, details in self.pathology_keywords.items():
            if pathology in sentence:
                # Extract location
                location = self._extract_location(sentence)
                
                # Extract severity modifiers
                severity = self._extract_severity(sentence, details['severity'])
                
                # Calculate confidence based on context
                confidence = self._calculate_finding_confidence(sentence, pathology)
                
                finding = {
                    'type': 'pathological',
                    'finding': pathology.capitalize(),
                    'location': location or details['location'],
                    'severity': severity,
                    'confidence': confidence,
                    'context': sentence.strip(),
                    'urgency': details['urgency']
                }
                
                findings.append(finding)
        
        return findings
    
    def _extract_normal_findings(self, sentence: str) -> List[Dict[str, Any]]:
        """
        Extract normal findings from a sentence
        """
        findings = []
        
        for indicator in self.normal_indicators:
            if indicator in sentence:
                # Extract what is normal
                normal_structure = self._extract_normal_structure(sentence, indicator)
                
                finding = {
                    'type': 'normal',
                    'finding': f"{normal_structure} appears {indicator}",
                    'confidence': 90,
                    'context': sentence.strip()
                }
                
                findings.append(finding)
                break  # Only one normal finding per sentence
        
        return findings
    
    def _extract_location(self, sentence: str) -> str:
        """
        Extract anatomical location from sentence
        """
        for location in self.anatomical_locations:
            if location in sentence:
                return location
        
        # Try to extract location using patterns
        location_patterns = [
            r'(right|left)\s+(upper|middle|lower)\s+(lobe|lung)',
            r'(bilateral|both)\s+(lung|lungs)',
            r'(heart|cardiac|mediastinal|pleural)'
        ]
        
        for pattern in location_patterns:
            match = re.search(pattern, sentence)
            if match:
                return match.group(0)
        
        return None
    
    def _extract_severity(self, sentence: str, default_severity: str) -> str:
        """
        Extract severity modifiers from sentence
        """
        for modifier, level in self.severity_modifiers.items():
            if modifier in sentence:
                if level == 1:
                    return 'mild'
                elif level == 2:
                    return 'moderate'
                else:
                    return 'severe'
        
        return default_severity
    
    def _calculate_finding_confidence(self, sentence: str, finding: str) -> float:
        """
        Calculate confidence score for a finding based on context
        """
        base_confidence = 80
        
        # Increase confidence for specific descriptive terms
        descriptive_terms = ['consistent with', 'suggestive of', 'compatible with']
        if any(term in sentence for term in descriptive_terms):
            base_confidence += 10
        
        # Decrease confidence for uncertain terms
        uncertain_terms = ['possible', 'probable', 'likely', 'suspicious', 'questionable']
        if any(term in sentence for term in uncertain_terms):
            base_confidence -= 15
        
        # Increase confidence for definitive terms
        definitive_terms = ['definite', 'clear', 'obvious', 'evident']
        if any(term in sentence for term in definitive_terms):
            base_confidence += 15
        
        # Adjust based on negation
        negation_terms = ['no', 'not', 'without', 'absent', 'negative']
        if any(term in sentence for term in negation_terms):
            # This might be a negative finding, adjust accordingly
            if finding in sentence:
                base_confidence -= 20
        
        return max(30, min(95, base_confidence))
    
    def _extract_normal_structure(self, sentence: str, indicator: str) -> str:
        """
        Extract what anatomical structure is described as normal
        """
        # Look for anatomical terms near the normal indicator
        anatomical_terms = [
            'heart', 'lungs', 'lung fields', 'mediastinum', 'bones',
            'ribs', 'spine', 'diaphragm', 'pleura', 'cardiac silhouette'
        ]
        
        for term in anatomical_terms:
            if term in sentence:
                return term
        
        return 'structure'
    
    def _merge_similar_findings(self, findings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Merge similar findings to avoid duplicates
        """
        merged_findings = []
        processed_findings = set()
        
        for finding in findings:
            finding_key = f"{finding['finding']}_{finding.get('location', '')}"
            
            if finding_key not in processed_findings:
                merged_findings.append(finding)
                processed_findings.add(finding_key)
        
        return merged_findings
    
    def assess_report_quality(self, text: str) -> Dict[str, Any]:
        """
        Assess the quality of the radiology report
        """
        # Basic metrics
        word_count = len(text.split())
        sentence_count = len(self._split_into_sentences(text))
        
        # Check for required sections
        sections = self._identify_report_sections(text)
        
        # Calculate readability
        readability_score = self._calculate_readability(text)
        
        # Check for medical terminology usage
        medical_term_count = self._count_medical_terms(text)
        
        # Assess completeness
        completeness_score = self._assess_completeness(sections, word_count)
        
        # Assess clarity
        clarity_score = self._assess_clarity(text, sentence_count, word_count)
        
        # Overall quality score
        overall_score = (completeness_score + clarity_score + readability_score) / 3
        
        return {
            'overall_score': round(overall_score, 1),
            'completeness_score': round(completeness_score, 1),
            'clarity_score': round(clarity_score, 1),
            'readability_score': round(readability_score, 1),
            'word_count': word_count,
            'sentence_count': sentence_count,
            'medical_term_count': medical_term_count,
            'sections_identified': sections,
            'assessment': self._get_quality_assessment(overall_score)
        }
    
    def _identify_report_sections(self, text: str) -> List[str]:
        """
        Identify sections in the radiology report
        """
        text_lower = text.lower()
        sections = []
        
        section_indicators = {
            'clinical_history': ['clinical history', 'history', 'indication'],
            'technique': ['technique', 'method', 'protocol'],
            'findings': ['findings', 'observations', 'results'],
            'impression': ['impression', 'conclusion', 'diagnosis', 'assessment']
        }
        
        for section_name, indicators in section_indicators.items():
            if any(indicator in text_lower for indicator in indicators):
                sections.append(section_name)
        
        return sections
    
    def _calculate_readability(self, text: str) -> float:
        """
        Calculate readability score (simplified)
        """
        words = text.split()
        sentences = self._split_into_sentences(text)
        
        if not sentences:
            return 0
        
        avg_words_per_sentence = len(words) / len(sentences)
        
        # Medical reports should have moderate sentence length
        if 10 <= avg_words_per_sentence <= 20:
            return 85
        elif 8 <= avg_words_per_sentence <= 25:
            return 75
        else:
            return 60
    
    def _count_medical_terms(self, text: str) -> int:
        """
        Count medical terminology in the text
        """
        text_lower = text.lower()
        medical_terms = list(self.pathology_keywords.keys()) + [
            'radiograph', 'ct', 'mri', 'ultrasound', 'contrast',
            'anterior', 'posterior', 'lateral', 'medial', 'superior', 'inferior'
        ]
        
        return sum(1 for term in medical_terms if term in text_lower)
    
    def _assess_completeness(self, sections: List[str], word_count: int) -> float:
        """
        Assess report completeness
        """
        required_sections = ['findings', 'impression']
        optional_sections = ['clinical_history', 'technique']
        
        score = 0
        
        # Required sections
        for section in required_sections:
            if section in sections:
                score += 40
        
        # Optional sections
        for section in optional_sections:
            if section in sections:
                score += 10
        
        # Word count bonus
        if word_count >= 50:
            score += 10
        elif word_count >= 30:
            score += 5
        
        return min(100, score)
    
    def _assess_clarity(self, text: str, sentence_count: int, word_count: int) -> float:
        """
        Assess report clarity
        """
        score = 70  # Base score
        
        # Sentence structure
        if sentence_count > 0:
            avg_words_per_sentence = word_count / sentence_count
            if 8 <= avg_words_per_sentence <= 25:
                score += 15
            else:
                score -= 10
        
        # Check for unclear terms
        unclear_terms = ['thing', 'stuff', 'something', 'maybe', 'perhaps']
        if any(term in text.lower() for term in unclear_terms):
            score -= 15
        
        # Check for specific medical terminology
        if self._count_medical_terms(text) >= 3:
            score += 10
        
        return max(0, min(100, score))
    
    def _get_quality_assessment(self, score: float) -> str:
        """
        Get qualitative assessment based on score
        """
        if score >= 85:
            return 'Excellent'
        elif score >= 75:
            return 'Good'
        elif score >= 65:
            return 'Fair'
        else:
            return 'Poor'

# Example usage
def test_medical_nlp():
    """
    Test the Medical NLP functionality
    """
    nlp = MedicalNLP()
    
    sample_text = """
    CLINICAL HISTORY: 45-year-old male with cough and fever.
    
    FINDINGS: The heart size is normal. There is a focal opacity in the 
    right lower lobe consistent with pneumonia. No pleural effusion. 
    The left lung is clear.
    
    IMPRESSION: Right lower lobe pneumonia.
    """
    
    print("🔬 Medical NLP Analysis")
    print("=" * 40)
    
    # Extract findings
    findings = nlp.extract_clinical_findings(sample_text)
    print(f"📋 Clinical Findings ({len(findings)}):")
    for finding in findings:
        print(f"  • {finding['finding']} ({finding['type']}) - Confidence: {finding['confidence']:.1f}%")
    
    # Assess quality
    quality = nlp.assess_report_quality(sample_text)
    print(f"\n📊 Report Quality Assessment:")
    print(f"  • Overall Score: {quality['overall_score']}/100 ({quality['assessment']})")
    print(f"  • Completeness: {quality['completeness_score']}/100")
    print(f"  • Clarity: {quality['clarity_score']}/100")
    print(f"  • Medical Terms: {quality['medical_term_count']}")

if __name__ == "__main__":
    test_medical_nlp()
