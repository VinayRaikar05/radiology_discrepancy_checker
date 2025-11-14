import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
import joblib
import logging
from typing import Dict, List, Any, Tuple
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class RadiologyMLModels:
    """
    Machine Learning models for radiology analysis
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.label_encoders = {}
        self.feature_names = []
        self.is_trained = False
        
        # Initialize models
        self._initialize_models()
    
    def _initialize_models(self):
        """
        Initialize machine learning models
        """
        self.models = {
            'pathology_detector': RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                class_weight='balanced'
            ),
            'severity_classifier': GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=6,
                random_state=42
            ),
            'quality_assessor': LogisticRegression(
                random_state=42,
                max_iter=1000
            ),
            'discrepancy_detector': RandomForestClassifier(
                n_estimators=150,
                max_depth=12,
                random_state=42,
                class_weight='balanced'
            )
        }
        
        # Initialize scalers for each model
        for model_name in self.models.keys():
            self.scalers[model_name] = StandardScaler()
    
    def generate_synthetic_training_data(self, n_samples: int = 1000) -> Dict[str, Any]:
        """
        Generate synthetic training data for demonstration
        """
        np.random.seed(42)
        
        # Generate features
        features = {
            # Image features
            'contrast': np.random.normal(50, 15, n_samples),
            'brightness': np.random.normal(128, 30, n_samples),
            'sharpness': np.random.normal(75, 20, n_samples),
            'symmetry_score': np.random.beta(2, 2, n_samples),
            'edge_density': np.random.gamma(2, 0.1, n_samples),
            
            # Text features
            'word_count': np.random.poisson(80, n_samples),
            'medical_term_count': np.random.poisson(12, n_samples),
            'sentence_count': np.random.poisson(8, n_samples),
            'completeness_score': np.random.beta(3, 1, n_samples) * 100,
            'clarity_score': np.random.beta(3, 1, n_samples) * 100,
            
            # Cross-modal features
            'text_image_agreement': np.random.beta(3, 1, n_samples),
            'finding_count_text': np.random.poisson(3, n_samples),
            'finding_count_image': np.random.poisson(3, n_samples),
            'confidence_variance': np.random.gamma(1, 10, n_samples),
        }
        
        # Create DataFrame
        df = pd.DataFrame(features)
        
        # Generate target variables
        targets = self._generate_synthetic_targets(df)
        
        return {
            'features': df,
            'targets': targets,
            'feature_names': list(df.columns)
        }
    
    def _generate_synthetic_targets(self, features_df: pd.DataFrame) -> Dict[str, np.ndarray]:
        """
        Generate synthetic target variables based on features
        """
        n_samples = len(features_df)
        
        # Pathology detection (binary)
        pathology_prob = (
            (features_df['contrast'] > 60).astype(int) * 0.3 +
            (features_df['edge_density'] > 0.15).astype(int) * 0.4 +
            (features_df['symmetry_score'] < 0.7).astype(int) * 0.3 +
            np.random.normal(0, 0.1, n_samples)
        )
        pathology_labels = (pathology_prob > 0.5).astype(int)
        
        # Severity classification (0: mild, 1: moderate, 2: severe)
        severity_score = (
            features_df['contrast'] / 100 * 0.4 +
            features_df['edge_density'] * 2 * 0.3 +
            (1 - features_df['symmetry_score']) * 0.3 +
            np.random.normal(0, 0.1, n_samples)
        )
        severity_labels = np.digitize(severity_score, bins=[0, 0.3, 0.6, 1.0]) - 1
        severity_labels = np.clip(severity_labels, 0, 2)
        
        # Quality assessment (0: poor, 1: fair, 2: good, 3: excellent)
        quality_score = (
            features_df['sharpness'] / 100 * 0.3 +
            features_df['contrast'] / 100 * 0.3 +
            features_df['completeness_score'] / 100 * 0.2 +
            features_df['clarity_score'] / 100 * 0.2 +
            np.random.normal(0, 0.1, n_samples)
        )
        quality_labels = np.digitize(quality_score, bins=[0, 0.25, 0.5, 0.75, 1.0]) - 1
        quality_labels = np.clip(quality_labels, 0, 3)
        
        # Discrepancy detection (binary)
        discrepancy_prob = (
            (np.abs(features_df['finding_count_text'] - features_df['finding_count_image']) > 1).astype(int) * 0.4 +
            (features_df['text_image_agreement'] < 0.6).astype(int) * 0.4 +
            (features_df['confidence_variance'] > 15).astype(int) * 0.2 +
            np.random.normal(0, 0.1, n_samples)
        )
        discrepancy_labels = (discrepancy_prob > 0.5).astype(int)
        
        return {
            'pathology': pathology_labels,
            'severity': severity_labels,
            'quality': quality_labels,
            'discrepancy': discrepancy_labels
        }
    
    def train_models(self, training_data: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Train all ML models
        """
        if training_data is None:
            print("🔄 Generating synthetic training data...")
            training_data = self.generate_synthetic_training_data(2000)
        
        features = training_data['features']
        targets = training_data['targets']
        self.feature_names = training_data['feature_names']
        
        training_results = {}
        
        print("🤖 Training machine learning models...")
        
        # Train each model
        for model_name, target_name in [
            ('pathology_detector', 'pathology'),
            ('severity_classifier', 'severity'),
            ('quality_assessor', 'quality'),
            ('discrepancy_detector', 'discrepancy')
        ]:
            print(f"  📊 Training {model_name}...")
            
            # Prepare data
            X = features.values
            y = targets[target_name]
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y
            )
            
            # Scale features
            X_train_scaled = self.scalers[model_name].fit_transform(X_train)
            X_test_scaled = self.scalers[model_name].transform(X_test)
            
            # Train model
            self.models[model_name].fit(X_train_scaled, y_train)
            
            # Evaluate model
            train_score = self.models[model_name].score(X_train_scaled, y_train)
            test_score = self.models[model_name].score(X_test_scaled, y_test)
            
            # Cross-validation
            cv_scores = cross_val_score(
                self.models[model_name], X_train_scaled, y_train, cv=5
            )
            
            training_results[model_name] = {
                'train_accuracy': train_score,
                'test_accuracy': test_score,
                'cv_mean': np.mean(cv_scores),
                'cv_std': np.std(cv_scores),
                'feature_importance': self._get_feature_importance(model_name)
            }
            
            print(f"    ✅ {model_name}: Test Accuracy = {test_score:.3f}")
        
        self.is_trained = True
        print("🎉 All models trained successfully!")
        
        return training_results
    
    def _get_feature_importance(self, model_name: str) -> Dict[str, float]:
        """
        Get feature importance for tree-based models
        """
        model = self.models[model_name]
        
        if hasattr(model, 'feature_importances_'):
            importance_dict = {}
            for i, importance in enumerate(model.feature_importances_):
                if i < len(self.feature_names):
                    importance_dict[self.feature_names[i]] = float(importance)
            return importance_dict
        else:
            return {}
    
    def predict_pathology(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict presence of pathology
        """
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        # Prepare features
        feature_vector = self._prepare_feature_vector(features)
        feature_vector_scaled = self.scalers['pathology_detector'].transform([feature_vector])
        
        # Make prediction
        prediction = self.models['pathology_detector'].predict(feature_vector_scaled)[0]
        probability = self.models['pathology_detector'].predict_proba(feature_vector_scaled)[0]
        
        return {
            'has_pathology': bool(prediction),
            'confidence': float(probability[1]) if prediction else float(probability[0]),
            'probability_pathology': float(probability[1]),
            'probability_normal': float(probability[0])
        }
    
    def predict_severity(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict severity of findings
        """
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        feature_vector = self._prepare_feature_vector(features)
        feature_vector_scaled = self.scalers['severity_classifier'].transform([feature_vector])
        
        prediction = self.models['severity_classifier'].predict(feature_vector_scaled)[0]
        probabilities = self.models['severity_classifier'].predict_proba(feature_vector_scaled)[0]
        
        severity_labels = ['mild', 'moderate', 'severe']
        
        return {
            'severity': severity_labels[prediction],
            'confidence': float(probabilities[prediction]),
            'probabilities': {
                severity_labels[i]: float(prob) 
                for i, prob in enumerate(probabilities)
            }
        }
    
    def predict_quality(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict report/image quality
        """
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        feature_vector = self._prepare_feature_vector(features)
        feature_vector_scaled = self.scalers['quality_assessor'].transform([feature_vector])
        
        prediction = self.models['quality_assessor'].predict(feature_vector_scaled)[0]
        probabilities = self.models['quality_assessor'].predict_proba(feature_vector_scaled)[0]
        
        quality_labels = ['poor', 'fair', 'good', 'excellent']
        
        return {
            'quality': quality_labels[prediction],
            'confidence': float(probabilities[prediction]),
            'score': float((prediction + 1) * 25),  # Convert to 0-100 scale
            'probabilities': {
                quality_labels[i]: float(prob) 
                for i, prob in enumerate(probabilities)
            }
        }
    
    def predict_discrepancy(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Predict presence of discrepancies
        """
        if not self.is_trained:
            return {'error': 'Models not trained yet'}
        
        feature_vector = self._prepare_feature_vector(features)
        feature_vector_scaled = self.scalers['discrepancy_detector'].transform([feature_vector])
        
        prediction = self.models['discrepancy_detector'].predict(feature_vector_scaled)[0]
        probability = self.models['discrepancy_detector'].predict_proba(feature_vector_scaled)[0]
        
        return {
            'has_discrepancy': bool(prediction),
            'confidence': float(probability[1]) if prediction else float(probability[0]),
            'risk_level': self._get_risk_level(probability[1])
        }
    
    def _prepare_feature_vector(self, features: Dict[str, float]) -> List[float]:
        """
        Prepare feature vector from feature dictionary
        """
        feature_vector = []
        
        # Default values for missing features
        default_values = {
            'contrast': 50.0,
            'brightness': 128.0,
            'sharpness': 75.0,
            'symmetry_score': 0.8,
            'edge_density': 0.1,
            'word_count': 80.0,
            'medical_term_count': 12.0,
            'sentence_count': 8.0,
            'completeness_score': 80.0,
            'clarity_score': 80.0,
            'text_image_agreement': 0.8,
            'finding_count_text': 3.0,
            'finding_count_image': 3.0,
            'confidence_variance': 10.0
        }
        
        for feature_name in self.feature_names:
            value = features.get(feature_name, default_values.get(feature_name, 0.0))
            feature_vector.append(float(value))
        
        return feature_vector
    
    def _get_risk_level(self, probability: float) -> str:
        """
        Convert probability to risk level
        """
        if probability >= 0.7:
            return 'high'
        elif probability >= 0.4:
            return 'medium'
        else:
            return 'low'
    
    def comprehensive_analysis(self, features: Dict[str, float]) -> Dict[str, Any]:
        """
        Perform comprehensive ML analysis
        """
        if not self.is_trained:
            # Train models with synthetic data
            self.train_models()
        
        # Get predictions from all models
        pathology_pred = self.predict_pathology(features)
        severity_pred = self.predict_severity(features)
        quality_pred = self.predict_quality(features)
        discrepancy_pred = self.predict_discrepancy(features)
        
        # Calculate overall confidence
        overall_confidence = np.mean([
            pathology_pred.get('confidence', 0),
            severity_pred.get('confidence', 0),
            quality_pred.get('confidence', 0),
            discrepancy_pred.get('confidence', 0)
        ])
        
        # Determine overall risk level
        risk_factors = []
        if pathology_pred.get('has_pathology', False):
            risk_factors.append('pathology_detected')
        if severity_pred.get('severity') == 'severe':
            risk_factors.append('severe_findings')
        if quality_pred.get('quality') in ['poor', 'fair']:
            risk_factors.append('quality_issues')
        if discrepancy_pred.get('has_discrepancy', False):
            risk_factors.append('discrepancies_found')
        
        overall_risk = 'high' if len(risk_factors) >= 2 else 'medium' if risk_factors else 'low'
        
        return {
            'pathology_analysis': pathology_pred,
            'severity_analysis': severity_pred,
            'quality_analysis': quality_pred,
            'discrepancy_analysis': discrepancy_pred,
            'overall_confidence': float(overall_confidence),
            'overall_risk_level': overall_risk,
            'risk_factors': risk_factors,
            'ml_summary': self._generate_ml_summary(
                pathology_pred, severity_pred, quality_pred, discrepancy_pred
            )
        }
    
    def _generate_ml_summary(self, pathology: Dict, severity: Dict, 
                           quality: Dict, discrepancy: Dict) -> str:
        """
        Generate ML analysis summary
        """
        summary_parts = []
        
        # Pathology summary
        if pathology.get('has_pathology', False):
            summary_parts.append(f"ML models detected pathology with {pathology['confidence']:.1%} confidence")
        else:
            summary_parts.append("ML models suggest normal findings")
        
        # Severity summary
        if severity.get('severity'):
            summary_parts.append(f"Severity classified as {severity['severity']}")
        
        # Quality summary
        if quality.get('quality'):
            summary_parts.append(f"Overall quality assessed as {quality['quality']}")
        
        # Discrepancy summary
        if discrepancy.get('has_discrepancy', False):
            summary_parts.append("Potential discrepancies detected")
        
        return ". ".join(summary_parts) + "."
    
    def save_models(self, filepath: str):
        """
        Save trained models to file
        """
        if not self.is_trained:
            raise ValueError("Models must be trained before saving")
        
        model_data = {
            'models': self.models,
            'scalers': self.scalers,
            'feature_names': self.feature_names,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, filepath)
        print(f"✅ Models saved to {filepath}")
    
    def load_models(self, filepath: str):
        """
        Load trained models from file
        """
        try:
            model_data = joblib.load(filepath)
            self.models = model_data['models']
            self.scalers = model_data['scalers']
            self.feature_names = model_data['feature_names']
            self.is_trained = model_data['is_trained']
            print(f"✅ Models loaded from {filepath}")
        except Exception as e:
            print(f"❌ Failed to load models: {str(e)}")

# Example usage and testing
def test_ml_models():
    """
    Test the ML models functionality
    """
    print("🤖 Machine Learning Models for Radiology Analysis")
    print("=" * 60)
    
    # Initialize ML models
    ml_models = RadiologyMLModels()
    
    # Train models
    training_results = ml_models.train_models()
    
    # Display training results
    print("\n📊 Training Results:")
    for model_name, results in training_results.items():
        print(f"  {model_name}:")
        print(f"    Test Accuracy: {results['test_accuracy']:.3f}")
        print(f"    CV Score: {results['cv_mean']:.3f} ± {results['cv_std']:.3f}")
    
    # Test with sample features
    sample_features = {
        'contrast': 65.0,
        'brightness': 120.0,
        'sharpness': 80.0,
        'symmetry_score': 0.75,
        'edge_density': 0.12,
        'word_count': 95.0,
        'medical_term_count': 15.0,
        'sentence_count': 10.0,
        'completeness_score': 85.0,
        'clarity_score': 78.0,
        'text_image_agreement': 0.82,
        'finding_count_text': 2.0,
        'finding_count_image': 3.0,
        'confidence_variance': 12.0
    }
    
    print(f"\n🔬 Comprehensive ML Analysis:")
    analysis_result = ml_models.comprehensive_analysis(sample_features)
    
    print(f"Overall Risk Level: {analysis_result['overall_risk_level'].upper()}")
    print(f"Overall Confidence: {analysis_result['overall_confidence']:.1%}")
    print(f"Risk Factors: {', '.join(analysis_result['risk_factors']) if analysis_result['risk_factors'] else 'None'}")
    print(f"ML Summary: {analysis_result['ml_summary']}")
    
    # Individual predictions
    print(f"\n📋 Detailed Predictions:")
    print(f"  Pathology: {'Detected' if analysis_result['pathology_analysis']['has_pathology'] else 'Not detected'}")
    print(f"  Severity: {analysis_result['severity_analysis']['severity'].title()}")
    print(f"  Quality: {analysis_result['quality_analysis']['quality'].title()}")
    print(f"  Discrepancies: {'Found' if analysis_result['discrepancy_analysis']['has_discrepancy'] else 'None detected'}")

if __name__ == "__main__":
    test_ml_models()
