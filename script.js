document.addEventListener('DOMContentLoaded', function() {
    let isMetric = false;

    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    
    hamburger.addEventListener('click', function() {
      this.classList.toggle('active');
      navMenu.classList.toggle('show');
    });

    // Close mobile menu when clicking on a link
    document.querySelectorAll('nav ul li a').forEach(link => {
      link.addEventListener('click', function() {
        hamburger.classList.remove('active');
        navMenu.classList.remove('show');
      });
    });

    const calculateBtn = document.getElementById('calculateBtn');
    const heightGroup = document.getElementById('heightGroup');
    const switchToCm = document.getElementById('switchToCm');
    const ageInput = document.getElementById('age');
    const weightInput = document.getElementById('weight');
    const heightFtInput = document.getElementById('heightFt');
    const heightInInput = document.getElementById('heightIn');
    const resultBox = document.getElementById('resultBox');

    calculateBtn.addEventListener('click', calculateBMI);
    switchToCm.addEventListener('click', toggleUnits);

    if (heightFtInput) {
      heightFtInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
        
        if (this.value > 9) {
          this.value = 9;
        } else if (this.value < 1 && this.value !== '') {
          this.value = 1;
        }
        
        if (this.value.length === 1 && heightInInput) {
          heightInInput.focus();
        }
      });
      
      heightFtInput.addEventListener('keydown', function(e) {
        if (e.key === '.' || e.key === ',') {
          e.preventDefault();
        }
      });
    }

    if (heightInInput) {
      heightInInput.addEventListener('keydown', function(e) {
        if (e.key === '.' || e.key === ',') {
          e.preventDefault();
        }
      });
    // Auto focus to heightFtInput after valid 2-digit age
    ageInput.addEventListener("input", function () {
    const value = parseInt(ageInput.value);

     if (ageInput.value.length === 2 && value >= 2 && value <= 99) {
     heightFtInput.focus();
     }
     });
      heightInInput.addEventListener('input', function() {
        this.value = this.value.replace(/[^0-9]/g, '');
        
        if (this.value > 11) {
          this.value = 11;
        }
      });
    }

    document.querySelectorAll('.bar-labels span').forEach(label => {
      label.addEventListener('click', function() {
        const category = this.textContent.split(' ')[0].toLowerCase();
        showCategoryDetails(category);
      });
    });

    function calculateBMI() {
      hideErrors();
      
      const age = parseFloat(ageInput.value);
      const weight = parseFloat(weightInput.value);
      let heightInMeters;
      
      if (isMetric) {
        const heightCm = parseFloat(document.getElementById("heightCm")?.value);
        if (isNaN(heightCm)) {
          showError('heightError');
          return;
        }
        heightInMeters = heightCm / 100;
      } else {
        const heightFt = parseFloat(document.getElementById("heightFt").value);
        let heightIn = parseFloat(document.getElementById("heightIn").value);
        
        if (isNaN(heightFt) || heightFt < 1 || heightFt > 9) {
          showError('heightError');
          return;
        }
        
        if (isNaN(heightIn)) {
          heightIn = 0;
        } else if (heightIn < 0 || heightIn > 11) {
          showError('heightError');
          return;
        }
        
        heightInMeters = (heightFt * 12 + heightIn) * 0.0254;
      }
      
      if (isNaN(age) || age < 2 || age > 120) {
        showError('ageError');
        return;
      }
      
      if (isNaN(weight) || weight < 10 || weight > 300) {
        showError('weightError');
        return;
      }
      
      const bmi = calculateBMIValue(weight, heightInMeters);
      displayResults(bmi);
      
      // Scroll to results after calculation
      setTimeout(() => {
        const resultBoxTop = resultBox.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        const scrollPosition = window.scrollY + resultBoxTop - (windowHeight / 3);
        
        window.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }

    function calculateBMIValue(weight, height) {
      return weight / (height * height);
    }

    function displayResults(bmi) {
      const bmiRounded = bmi.toFixed(1);
      const bmiResult = document.getElementById("bmiResult");
      const weightStatus = document.getElementById("weightStatus");
      const needle = document.getElementById("needle");
      const healthTips = document.getElementById("healthTips");

      const category = getBMICategory(bmi);
      
      bmiResult.innerText = bmiRounded;
      bmiResult.className = "bmi-value " + category.className;
      weightStatus.textContent = category.message.toUpperCase();
      weightStatus.style.color = getComputedStyle(bmiResult).backgroundColor;
      
      // Calculate needle position for equal segments
      const segments = [
        { min: 0, max: 18.5, position: 0 },    // Underweight (0-25%)
        { min: 18.5, max: 25, position: 25 },  // Normal (25-50%)
        { min: 25, max: 30, position: 50 },     // Overweight (50-75%)
        { min: 30, max: 40, position: 75 }      // Obese (75-100%)
      ];
      
      let needlePosition = 0;
      let foundSegment = false;
      
      segments.forEach(segment => {
        if (!foundSegment && bmi >= segment.min && bmi < segment.max) {
          const segmentRange = segment.max - segment.min;
          const positionInSegment = (bmi - segment.min) / segmentRange;
          needlePosition = segment.position + (positionInSegment * 25);
          foundSegment = true;
        }
      });
      
      // Handle BMI values at or above 40
      if (bmi >= 40) {
        needlePosition = 100;
      }
      
      needle.style.left = `calc(${needlePosition}% - 4px)`;
      
      healthTips.innerHTML = category.tips.map(tip => `<li>${tip}</li>`).join('');
    }

    function getBMICategory(bmi) {
      if (bmi < 16) {
        return {
          message: "Severely underweight - Consult a doctor",
          className: "category-underweight",
          tips: [
            "🍎 Increase calorie intake with nutrient-dense foods",
            "💪 Include strength training to build muscle",
            "👨‍⚕️ Consult a doctor if losing weight unintentionally"
          ]
        };
      } else if (bmi < 18.5) {
        return {
          message: "Underweight - Consider gaining weight",
          className: "category-underweight",
          tips: [
            "🥑 Eat healthy fats (nuts, avocados, olive oil)",
            "🍗 Prioritize protein (chicken, fish, beans)",
            "📈 Aim for gradual weight gain (0.5kg/week)"
          ]
        };
      } else if (bmi < 25) {
        return {
          message: "Normal weight - Keep it up!",
          className: "category-normal",
          tips: [
            "🏋️‍♂️ Exercise 3-5 times per week",
            "🥦 Fill half your plate with vegetables",
            "💧 Drink 2L of water daily"
          ]
        };
      } else if (bmi < 30) {
        return {
          message: "Overweight - Time to exercise!",
          className: "category-overweight",
          tips: [
            "🚶‍♂️ Walk 10,000 steps daily",
            "🍎 Replace sugary snacks with fruits",
            "⏲️ Practice mindful eating (slow down)"
          ]
        };
      } else if (bmi < 35) {
        return {
          message: "Obese (Class I) - High health risk",
          className: "category-obese",
          tips: [
            "🏥 Schedule a doctor's appointment",
            "🍽️ Use smaller plates to control portions",
            "🧘‍♂️ Manage stress to prevent emotional eating"
          ]
        };
      } else {
        return {
          message: "Obese (Class II/III) - Very high risk",
          className: "category-obese",
          tips: [
            "🩺 Seek medical advice for a weight management plan",
            "📊 Track all meals in a food diary",
            "🚫 Limit processed foods and sugary drinks"
          ]
        };
      }
    }

    function showCategoryDetails(category) {
      document.querySelectorAll('.bar-labels span').forEach(span => {
        span.style.fontWeight = 'normal';
        span.style.textDecoration = 'none';
      });
      
      const activeLabel = Array.from(document.querySelectorAll('.bar-labels span')).find(span => 
        span.textContent.toLowerCase().includes(category)
      );
      
      if (activeLabel) {
        activeLabel.style.fontWeight = 'bold';
        activeLabel.style.textDecoration = 'underline';
      }
      
      const details = {
        'underweight': {
          description: "Underweight (BMI < 18.5)",
          risks: "Possible nutritional deficiency and osteoporosis",
          action: "Consider consulting a nutritionist to develop a healthy weight gain plan"
        },
        'normal': {
          description: "Normal weight (BMI 18.5-24.9)",
          risks: "Low risk (healthy range)",
          action: "Maintain your healthy lifestyle with balanced diet and regular exercise"
        },
        'overweight': {
          description: "Overweight (BMI 25-29.9)",
          risks: "Moderate risk of developing heart disease, high blood pressure, stroke, diabetes",
          action: "Consider increasing physical activity and reducing calorie intake"
        },
        'obese': {
          description: "Obese (BMI ≥ 30)",
          risks: "High risk of developing heart disease, high blood pressure, stroke, diabetes",
          action: "Consult with a healthcare provider about weight management options"
        }
      };
      
      alert(`${details[category].description}\n\nHealth Risks: ${details[category].risks}\n\nRecommended Action: ${details[category].action}`);
    }

    function toggleUnits() {
      isMetric = !isMetric;
      
      if (isMetric) {
        heightGroup.innerHTML = `
          <label>Height</label>
          <div class="input-container">
            <input type="number" id="heightCm" placeholder="Centimeter" min="50" max="250">
            <span class="unit-label">cm</span>
          </div>
          <span class="switch-unit" id="switchToFt">Switch to ft/in</span>
          <div class="error" id="heightError">Please enter valid height</div>
        `;
        document.getElementById('switchToFt').addEventListener('click', toggleUnits);
      } else {
        heightGroup.innerHTML = `
          <label>Height</label>
          <div class="input-group">
            <div class="input-container">
              <input type="number" id="heightFt" placeholder="Feet" min="1" max="9" pattern="[0-9]*" inputmode="numeric">
              <span class="unit-label">ft</span>
            </div>
            <div class="input-container">
              <input type="number" id="heightIn" placeholder="Inch" min="0" max="11" pattern="[0-9]*" inputmode="numeric">
              <span class="unit-label">in</span>
            </div>
          </div>
          <span class="switch-unit" id="switchToCm">Switch to cm</span>
          <div class="error" id="heightError">Please enter valid height</div>
        `;
        document.getElementById('switchToCm').addEventListener('click', toggleUnits);
        
        const newHeightFtInput = document.getElementById('heightFt');
        const newHeightInInput = document.getElementById('heightIn');
        
        if (newHeightFtInput) {
          newHeightFtInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value > 9) {
              this.value = 9;
            } else if (this.value < 1 && this.value !== '') {
              this.value = 1;
            }
            if (this.value.length === 1 && newHeightInInput) {
              newHeightInInput.focus();
            }
          });
          
          newHeightFtInput.addEventListener('keydown', function(e) {
            if (e.key === '.' || e.key === ',') {
              e.preventDefault();
            }
          });
        }
        
        if (newHeightInInput) {
          newHeightInInput.addEventListener('keydown', function(e) {
            if (e.key === '.' || e.key === ',') {
              e.preventDefault();
            }
          });
          
          newHeightInInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^0-9]/g, '');
            if (this.value > 11) {
              this.value = 11;
            }
          });
        }
      }
    }

    function hideErrors() {
      document.getElementById('ageError').style.display = 'none';
      document.getElementById('heightError').style.display = 'none';
      document.getElementById('weightError').style.display = 'none';
    }

    function showError(id) {
      document.getElementById(id).style.display = 'block';
    }
    
    // Ad refresh control (Google compliant)
    let lastAdRefresh = 0;
    const adRefreshInterval = 30000; // 30 seconds minimum
    
    function safeRefreshAd(adElement) {
      const now = Date.now();
      if (now - lastAdRefresh > adRefreshInterval) {
        if ('google' in window && google.ads && google.ads.getAds) {
          try {
            google.ads.getAds(adElement.id).refresh();
            lastAdRefresh = now;
            adElement.dataset.lastRefreshed = now;
          } catch (e) {
            console.log('Ad refresh error:', e);
          }
        }
      }
    }
    
    // Initialize ads
    document.querySelectorAll('.ad-container').forEach((ad, index) => {
      ad.id = 'ad-container-' + index;
    });
  });
