import cv2
import numpy as np
from PIL import Image, ImageEnhance, ImageFilter
import base64
import io
from typing import Dict, List, Tuple, Any
import matplotlib.pyplot as plt
from scipy import ndimage
from skimage import measure, morphology, filters
import logging

logger = logging.getLogger(__name__)

class MedicalImageProcessor:
    """
    Advanced computer vision processing for medical images
    """
    
    def __init__(self):
        self.supported_formats = ['JPEG', 'PNG', 'TIFF', 'BMP']
        self.min_image_size = (256, 256)
        self.max_image_size = (2048, 2048)
    
    def process_medical_image(self, image_data: str) -> Dict[str, Any]:
        """
        Comprehensive medical image processing pipeline
        """
        try:
            # Decode and load image
            image = self._decode_base64_image(image_data)
            
            # Validate image
            validation_result = self._validate_medical_image(image)
            if not validation_result['valid']:
                return {'success': False, 'error': validation_result['error']}
            
            # Convert to grayscale for analysis
            gray_image = self._convert_to_grayscale(image)
            
            # Enhance image quality
            enhanced_image = self._enhance_image_quality(gray_image)
            
            # Extract image features
            features = self._extract_image_features(enhanced_image)
            
            # Detect anatomical structures
            anatomical_structures = self._detect_anatomical_structures(enhanced_image)
            
            # Detect potential pathology
            pathology_findings = self._detect_pathology_regions(enhanced_image)
            
            # Calculate quality metrics
            quality_metrics = self._calculate_quality_metrics(gray_image, enhanced_image)
            
            # Generate analysis summary
            analysis_summary = self._generate_image_analysis_summary(
                features, anatomical_structures, pathology_findings, quality_metrics
            )
            
            return {
                'success': True,
                'features': features,
                'anatomical_structures': anatomical_structures,
                'pathology_findings': pathology_findings,
                'quality_metrics': quality_metrics,
                'analysis_summary': analysis_summary,
                'image_dimensions': gray_image.shape,
                'enhancement_applied': True
            }
            
        except Exception as e:
            logger.error(f"Image processing failed: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _decode_base64_image(self, image_data: str) -> np.ndarray:
        """
        Decode base64 image data
        """
        # Remove data URL prefix if present
        if ',' in image_data:
            image_data = image_data.split(',')[1]
        
        # Decode base64
        image_bytes = base64.b64decode(image_data)
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_bytes))
        
        # Convert to numpy array
        return np.array(pil_image)
    
    def _validate_medical_image(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Validate medical image for processing
        """
        height, width = image.shape[:2]
        
        # Check dimensions
        if height < self.min_image_size[0] or width < self.min_image_size[1]:
            return {
                'valid': False,
                'error': f'Image too small. Minimum size: {self.min_image_size}'
            }
        
        if height > self.max_image_size[0] or width > self.max_image_size[1]:
            return {
                'valid': False,
                'error': f'Image too large. Maximum size: {self.max_image_size}'
            }
        
        # Check if image has content
        if np.std(image) < 10:
            return {
                'valid': False,
                'error': 'Image appears to be blank or has very low contrast'
            }
        
        return {'valid': True}
    
    def _convert_to_grayscale(self, image: np.ndarray) -> np.ndarray:
        """
        Convert image to grayscale if needed
        """
        if len(image.shape) == 3:
            # Convert RGB to grayscale using medical imaging weights
            # These weights are optimized for medical images
            return cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
        return image
    
    def _enhance_image_quality(self, image: np.ndarray) -> np.ndarray:
        """
        Enhance medical image quality using advanced techniques
        """
        # Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(image)
        
        # Apply Gaussian blur to reduce noise
        denoised = cv2.GaussianBlur(enhanced, (3, 3), 0)
        
        # Apply unsharp masking for edge enhancement
        gaussian = cv2.GaussianBlur(denoised, (9, 9), 10.0)
        unsharp_mask = cv2.addWeighted(denoised, 1.5, gaussian, -0.5, 0)
        
        return np.clip(unsharp_mask, 0, 255).astype(np.uint8)
    
    def _extract_image_features(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Extract comprehensive image features
        """
        # Basic statistical features
        mean_intensity = np.mean(image)
        std_intensity = np.std(image)
        min_intensity = np.min(image)
        max_intensity = np.max(image)
        
        # Histogram features
        hist, _ = np.histogram(image, bins=256, range=(0, 256))
        hist_normalized = hist / np.sum(hist)
        
        # Texture features using Local Binary Patterns (simplified)
        texture_score = self._calculate_texture_score(image)
        
        # Edge features
        edges = cv2.Canny(image, 50, 150)
        edge_density = np.sum(edges > 0) / edges.size
        
        # Symmetry analysis (for chest X-rays)
        symmetry_score = self._calculate_symmetry_score(image)
        
        return {
            'mean_intensity': float(mean_intensity),
            'std_intensity': float(std_intensity),
            'intensity_range': float(max_intensity - min_intensity),
            'texture_score': float(texture_score),
            'edge_density': float(edge_density),
            'symmetry_score': float(symmetry_score),
            'histogram_entropy': float(self._calculate_entropy(hist_normalized))
        }
    
    def _calculate_texture_score(self, image: np.ndarray) -> float:
        """
        Calculate texture score using gradient magnitude
        """
        # Calculate gradients
        grad_x = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
        grad_y = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
        
        # Calculate gradient magnitude
        gradient_magnitude = np.sqrt(grad_x**2 + grad_y**2)
        
        # Return normalized texture score
        return np.mean(gradient_magnitude) / 255.0
    
    def _calculate_symmetry_score(self, image: np.ndarray) -> float:
        """
        Calculate bilateral symmetry score (useful for chest X-rays)
        """
        height, width = image.shape
        
        # Split image into left and right halves
        left_half = image[:, :width//2]
        right_half = image[:, width//2:]
        
        # Flip right half to compare with left
        right_half_flipped = np.fliplr(right_half)
        
        # Resize to match if needed
        min_width = min(left_half.shape[1], right_half_flipped.shape[1])
        left_half = left_half[:, :min_width]
        right_half_flipped = right_half_flipped[:, :min_width]
        
        # Calculate correlation coefficient
        correlation = np.corrcoef(left_half.flatten(), right_half_flipped.flatten())[0, 1]
        
        # Handle NaN case
        if np.isnan(correlation):
            correlation = 0
        
        return max(0, correlation)
    
    def _calculate_entropy(self, histogram: np.ndarray) -> float:
        """
        Calculate Shannon entropy of histogram
        """
        # Remove zero entries
        histogram = histogram[histogram > 0]
        
        # Calculate entropy
        entropy = -np.sum(histogram * np.log2(histogram))
        
        return entropy
    
    def _detect_anatomical_structures(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect anatomical structures using computer vision
        """
        structures = []
        height, width = image.shape
        
        # Detect heart region (central, lower area)
        heart_region = self._detect_heart_region(image)
        if heart_region:
            structures.append({
                'name': 'Heart',
                'location': heart_region['center'],
                'area': heart_region['area'],
                'confidence': heart_region['confidence'],
                'description': 'Cardiac silhouette detected'
            })
        
        # Detect lung fields
        lung_regions = self._detect_lung_fields(image)
        for i, lung in enumerate(lung_regions):
            structures.append({
                'name': f'Lung Field {i+1}',
                'location': lung['center'],
                'area': lung['area'],
                'confidence': lung['confidence'],
                'description': f'Lung field {i+1} identified'
            })
        
        # Detect rib structures
        rib_structures = self._detect_rib_structures(image)
        if rib_structures:
            structures.append({
                'name': 'Rib Cage',
                'location': {'x': width//2, 'y': height//2},
                'confidence': rib_structures['confidence'],
                'description': 'Rib structures visible'
            })
        
        return structures
    
    def _detect_heart_region(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Detect heart region using image processing
        """
        height, width = image.shape
        
        # Focus on central-lower region where heart typically appears
        roi_y_start = int(height * 0.3)
        roi_y_end = int(height * 0.8)
        roi_x_start = int(width * 0.3)
        roi_x_end = int(width * 0.7)
        
        roi = image[roi_y_start:roi_y_end, roi_x_start:roi_x_end]
        
        # Apply threshold to find dense regions
        _, binary = cv2.threshold(roi, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if contours:
            # Find largest contour (likely heart)
            largest_contour = max(contours, key=cv2.contourArea)
            area = cv2.contourArea(largest_contour)
            
            # Calculate center
            M = cv2.moments(largest_contour)
            if M["m00"] != 0:
                cx = int(M["m10"] / M["m00"]) + roi_x_start
                cy = int(M["m01"] / M["m00"]) + roi_y_start
                
                return {
                    'center': {'x': cx, 'y': cy},
                    'area': area,
                    'confidence': min(95, 60 + (area / 1000))
                }
        
        return None
    
    def _detect_lung_fields(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect lung field regions
        """
        height, width = image.shape
        lung_regions = []
        
        # Left lung field (right side of image)
        left_lung_roi = image[:, :width//2]
        left_lung_info = self._analyze_lung_region(left_lung_roi, 'left')
        if left_lung_info:
            lung_regions.append(left_lung_info)
        
        # Right lung field (left side of image)
        right_lung_roi = image[:, width//2:]
        right_lung_info = self._analyze_lung_region(right_lung_roi, 'right')
        if right_lung_info:
            # Adjust x coordinate for right lung
            right_lung_info['center']['x'] += width//2
            lung_regions.append(right_lung_info)
        
        return lung_regions
    
    def _analyze_lung_region(self, roi: np.ndarray, side: str) -> Dict[str, Any]:
        """
        Analyze individual lung region
        """
        height, width = roi.shape
        
        # Calculate average intensity (lungs should be darker)
        avg_intensity = np.mean(roi)
        
        # Calculate area of dark regions (air-filled lungs)
        _, binary = cv2.threshold(roi, avg_intensity * 0.8, 255, cv2.THRESH_BINARY_INV)
        dark_area = np.sum(binary > 0)
        
        # Calculate center of mass for dark regions
        y_coords, x_coords = np.where(binary > 0)
        if len(y_coords) > 0:
            center_x = int(np.mean(x_coords))
            center_y = int(np.mean(y_coords))
            
            return {
                'center': {'x': center_x, 'y': center_y},
                'area': dark_area,
                'confidence': min(90, 50 + (dark_area / (height * width)) * 100),
                'side': side
            }
        
        return None
    
    def _detect_rib_structures(self, image: np.ndarray) -> Dict[str, Any]:
        """
        Detect rib structures using edge detection
        """
        # Apply edge detection
        edges = cv2.Canny(image, 30, 100)
        
        # Apply Hough Line Transform to detect linear structures (ribs)
        lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=30, maxLineGap=10)
        
        if lines is not None and len(lines) > 5:  # Need multiple lines for rib detection
            return {
                'confidence': min(85, 40 + len(lines) * 2),
                'line_count': len(lines)
            }
        
        return None
    
    def _detect_pathology_regions(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect potential pathology regions using advanced image analysis
        """
        pathology_findings = []
        
        # Detect high-density regions (potential consolidations)
        consolidations = self._detect_consolidations(image)
        pathology_findings.extend(consolidations)
        
        # Detect low-density regions (potential pneumothorax)
        pneumothorax_regions = self._detect_pneumothorax(image)
        pathology_findings.extend(pneumothorax_regions)
        
        # Detect nodular structures
        nodules = self._detect_nodules(image)
        pathology_findings.extend(nodules)
        
        # Detect asymmetric regions
        asymmetric_regions = self._detect_asymmetric_regions(image)
        pathology_findings.extend(asymmetric_regions)
        
        return pathology_findings
    
    def _detect_consolidations(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect consolidation regions (high-density areas)
        """
        consolidations = []
        
        # Calculate threshold for high-density regions
        mean_intensity = np.mean(image)
        std_intensity = np.std(image)
        threshold = mean_intensity + 1.5 * std_intensity
        
        # Create binary mask for high-density regions
        _, binary = cv2.threshold(image, threshold, 255, cv2.THRESH_BINARY)
        
        # Apply morphological operations to clean up
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
        binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Filter by size (consolidations should be reasonably sized)
            if 100 < area < 5000:
                # Calculate center and bounding box
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    
                    x, y, w, h = cv2.boundingRect(contour)
                    
                    consolidations.append({
                        'type': 'Consolidation',
                        'location': self._get_anatomical_location(cx, cy, image.shape),
                        'center': {'x': cx, 'y': cy},
                        'bounding_box': {'x': x, 'y': y, 'width': w, 'height': h},
                        'area': area,
                        'confidence': min(85, 60 + (area / 100)),
                        'severity': self._assess_consolidation_severity(area),
                        'description': f'High-density region suggesting consolidation'
                    })
        
        return consolidations
    
    def _detect_pneumothorax(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect potential pneumothorax (abnormally dark regions)
        """
        pneumothorax_findings = []
        height, width = image.shape
        
        # Focus on peripheral lung regions where pneumothorax typically occurs
        peripheral_mask = np.zeros_like(image)
        cv2.rectangle(peripheral_mask, (0, 0), (width//4, height), 255, -1)  # Left edge
        cv2.rectangle(peripheral_mask, (3*width//4, 0), (width, height), 255, -1)  # Right edge
        
        # Calculate threshold for very dark regions
        mean_intensity = np.mean(image)
        threshold = mean_intensity * 0.3
        
        # Create binary mask for very dark regions
        _, binary = cv2.threshold(image, threshold, 255, cv2.THRESH_BINARY_INV)
        
        # Apply peripheral mask
        binary = cv2.bitwise_and(binary, peripheral_mask)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Filter by size
            if 200 < area < 3000:
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cx = int(M["m10"] / M["m00"])
                    cy = int(M["m01"] / M["m00"])
                    
                    pneumothorax_findings.append({
                        'type': 'Possible Pneumothorax',
                        'location': self._get_anatomical_location(cx, cy, image.shape),
                        'center': {'x': cx, 'y': cy},
                        'area': area,
                        'confidence': min(75, 40 + (area / 50)),
                        'severity': 'moderate',
                        'description': f'Abnormally dark region suggesting possible pneumothorax'
                    })
        
        return pneumothorax_findings
    
    def _detect_nodules(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect potential nodular structures
        """
        nodules = []
        
        # Apply Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(image, (5, 5), 0)
        
        # Use HoughCircles to detect circular structures
        circles = cv2.HoughCircles(
            blurred,
            cv2.HOUGH_GRADIENT,
            dp=1,
            minDist=20,
            param1=50,
            param2=30,
            minRadius=5,
            maxRadius=30
        )
        
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            
            for (x, y, r) in circles:
                # Calculate confidence based on circularity and contrast
                roi = image[max(0, y-r):min(image.shape[0], y+r), 
                           max(0, x-r):min(image.shape[1], x+r)]
                
                if roi.size > 0:
                    contrast = np.std(roi)
                    confidence = min(80, 30 + contrast)
                    
                    nodules.append({
                        'type': 'Nodule',
                        'location': self._get_anatomical_location(x, y, image.shape),
                        'center': {'x': x, 'y': y},
                        'radius': r,
                        'confidence': confidence,
                        'severity': 'mild' if r < 15 else 'moderate',
                        'description': f'Circular structure suggesting possible nodule (radius: {r}px)'
                    })
        
        return nodules
    
    def _detect_asymmetric_regions(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """
        Detect asymmetric regions between left and right lung fields
        """
        asymmetric_findings = []
        height, width = image.shape
        
        # Split image into left and right halves
        left_half = image[:, :width//2]
        right_half = image[:, width//2:]
        
        # Calculate regional statistics
        left_mean = np.mean(left_half)
        right_mean = np.mean(right_half)
        
        # Check for significant asymmetry
        asymmetry_ratio = abs(left_mean - right_mean) / max(left_mean, right_mean)
        
        if asymmetry_ratio > 0.15:  # 15% difference threshold
            side = 'left' if left_mean > right_mean else 'right'
            center_x = width//4 if side == 'left' else 3*width//4
            
            asymmetric_findings.append({
                'type': 'Asymmetric Density',
                'location': self._get_anatomical_location(center_x, height//2, image.shape),
                'center': {'x': center_x, 'y': height//2},
                'confidence': min(70, 30 + asymmetry_ratio * 100),
                'severity': 'moderate',
                'description': f'Asymmetric density - {side} side appears denser',
                'asymmetry_ratio': asymmetry_ratio
            })
        
        return asymmetric_findings
    
    def _get_anatomical_location(self, x: int, y: int, image_shape: Tuple[int, int]) -> str:
        """
        Convert pixel coordinates to anatomical location description
        """
        height, width = image_shape
        
        # Determine horizontal position
        if x < width * 0.33:
            horizontal = "right"  # Right side of patient (left side of image)
        elif x > width * 0.67:
            horizontal = "left"   # Left side of patient (right side of image)
        else:
            horizontal = "central"
        
        # Determine vertical position
        if y < height * 0.33:
            vertical = "upper"
        elif y > height * 0.67:
            vertical = "lower"
        else:
            vertical = "middle"
        
        # Combine for anatomical description
        if horizontal == "central":
            return f"{vertical} mediastinal region"
        else:
            return f"{horizontal} {vertical} lung field"
    
    def _assess_consolidation_severity(self, area: float) -> str:
        """
        Assess consolidation severity based on area
        """
        if area < 500:
            return 'mild'
        elif area < 1500:
            return 'moderate'
        else:
            return 'severe'
    
    def _calculate_quality_metrics(self, original: np.ndarray, enhanced: np.ndarray) -> Dict[str, Any]:
        """
        Calculate comprehensive image quality metrics
        """
        # Contrast metrics
        original_contrast = np.std(original)
        enhanced_contrast = np.std(enhanced)
        contrast_improvement = (enhanced_contrast - original_contrast) / original_contrast * 100
        
        # Sharpness metrics (using Laplacian variance)
        original_sharpness = cv2.Laplacian(original, cv2.CV_64F).var()
        enhanced_sharpness = cv2.Laplacian(enhanced, cv2.CV_64F).var()
        
        # Signal-to-noise ratio estimation
        snr = self._estimate_snr(enhanced)
        
        # Overall quality score
        quality_score = self._calculate_overall_quality_score(
            enhanced_contrast, enhanced_sharpness, snr
        )
        
        return {
            'contrast': {
                'original': float(original_contrast),
                'enhanced': float(enhanced_contrast),
                'improvement_percent': float(contrast_improvement)
            },
            'sharpness': {
                'original': float(original_sharpness),
                'enhanced': float(enhanced_sharpness)
            },
            'snr_estimate': float(snr),
            'overall_quality_score': float(quality_score),
            'quality_assessment': self._get_quality_assessment(quality_score)
        }
    
    def _estimate_snr(self, image: np.ndarray) -> float:
        """
        Estimate signal-to-noise ratio
        """
        # Calculate signal (mean intensity)
        signal = np.mean(image)
        
        # Estimate noise using Laplacian method
        laplacian = cv2.Laplacian(image, cv2.CV_64F)
        noise = np.std(laplacian)
        
        # Calculate SNR
        if noise > 0:
            snr = signal / noise
        else:
            snr = float('inf')
        
        return min(100, snr)  # Cap at 100 for practical purposes
    
    def _calculate_overall_quality_score(self, contrast: float, sharpness: float, snr: float) -> float:
        """
        Calculate overall image quality score
        """
        # Normalize metrics to 0-100 scale
        contrast_score = min(100, (contrast / 64) * 100)
        sharpness_score = min(100, (sharpness / 1000) * 100)
        snr_score = min(100, snr)
        
        # Weighted average
        quality_score = (contrast_score * 0.4 + sharpness_score * 0.4 + snr_score * 0.2)
        
        return quality_score
    
    def _get_quality_assessment(self, score: float) -> str:
        """
        Get qualitative assessment of image quality
        """
        if score >= 85:
            return 'Excellent'
        elif score >= 75:
            return 'Good'
        elif score >= 65:
            return 'Fair'
        elif score >= 50:
            return 'Poor'
        else:
            return 'Very Poor'
    
    def _generate_image_analysis_summary(self, features: Dict, structures: List, 
                                       pathology: List, quality: Dict) -> str:
        """
        Generate comprehensive image analysis summary
        """
        summary_parts = []
        
        # Quality assessment
        summary_parts.append(f"Image quality: {quality['quality_assessment']}")
        
        # Anatomical structures
        if structures:
            summary_parts.append(f"{len(structures)} anatomical structures identified")
        
        # Pathology findings
        if pathology:
            pathology_types = [p['type'] for p in pathology]
            unique_types = list(set(pathology_types))
            summary_parts.append(f"{len(pathology)} potential abnormalities detected: {', '.join(unique_types)}")
        else:
            summary_parts.append("No obvious pathological findings detected")
        
        # Technical metrics
        summary_parts.append(f"Contrast: {quality['contrast']['enhanced']:.1f}")
        summary_parts.append(f"SNR estimate: {quality['snr_estimate']:.1f}")
        
        return ". ".join(summary_parts) + "."

# Example usage and testing
def test_computer_vision():
    """
    Test the computer vision functionality
    """
    print("🖼️ Medical Computer Vision Analysis")
    print("=" * 50)
    
    # Create a sample medical image (simulated)
    sample_image = np.random.randint(0, 255, (512, 512), dtype=np.uint8)
    
    # Add some structure to simulate a chest X-ray
    # Heart region (brighter)
    cv2.circle(sample_image, (256, 350), 80, 180, -1)
    
    # Lung fields (darker)
    cv2.ellipse(sample_image, (150, 250), (100, 150), 0, 0, 360, 80, -1)
    cv2.ellipse(sample_image, (362, 250), (100, 150), 0, 0, 360, 80, -1)
    
    # Convert to base64 for testing
    _, buffer = cv2.imencode('.png', sample_image)
    image_base64 = base64.b64encode(buffer).decode('utf-8')
    image_data = f"data:image/png;base64,{image_base64}"
    
    # Process the image
    processor = MedicalImageProcessor()
    result = processor.process_medical_image(image_data)
    
    if result['success']:
        print("✅ Image processing successful")
        print(f"📊 Quality Score: {result['quality_metrics']['overall_quality_score']:.1f}/100")
        print(f"🏗️ Anatomical Structures: {len(result['anatomical_structures'])}")
        print(f"🔍 Pathology Findings: {len(result['pathology_findings'])}")
        print(f"📝 Summary: {result['analysis_summary']}")
    else:
        print(f"❌ Image processing failed: {result['error']}")

if __name__ == "__main__":
    test_computer_vision()
