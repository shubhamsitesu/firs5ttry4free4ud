      // Toggle the navbar links on hamburger menu click
      document.addEventListener('DOMContentLoaded', function() {
        const hamburgerMenu = document.querySelector('.hamburger-menu');
        const navbarLinks = document.querySelector('.navbar-links');
    
        hamburgerMenu.addEventListener('click', function() {
            navbarLinks.classList.toggle('active'); // Toggle 'active' class
        });
    });
    
// FD Calculator Functionality
document.querySelector('#fdCalculatorForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission
    document.getElementById('loadingSpinner').style.display = 'block'; // Show spinner

    setTimeout(() => { // Simulate loading time
        let principal = parseFloat(document.querySelector('#principal').value);
        let rate = parseFloat(document.querySelector('#rate').value);
        let years = parseFloat(document.querySelector('#tenure').value);
        let tenureUnit = document.querySelector('#tenure-unit').value;
        let compoundingFrequencyUnit = document.querySelector('#compoundingFrequency-unit').value;

        if (isNaN(principal) || isNaN(rate) || isNaN(years)) {
            alert('Please enter valid numbers for all fields.');
            document.getElementById('loadingSpinner').style.display = 'none'; // Hide spinner
            return;
        }

        // Calculate total months
        const totalMonths = tenureUnit === 'months' ? years : years * 12;

        // Calculate interest
        let interest;
        if (compoundingFrequencyUnit === 'quarterly') {
            interest = Math.round(principal * (Math.pow((1 + (rate / 100) / 4), 4 * (totalMonths / 12)) - 1));
        } else if (compoundingFrequencyUnit === 'monthly') {
            interest = Math.round(principal * (Math.pow((1 + (rate / 100) / 12), totalMonths) - 1));
        } else {
            interest = Math.round(principal * (Math.pow((1 + (rate / 100)), (totalMonths / 12)) - 1));
        }

        let maturityValue = Math.round(principal + interest);

        document.querySelector('#resultInterest').textContent = interest.toFixed(2);
        document.querySelector('#resultTotal').textContent = maturityValue.toFixed(2);

        // Show the results
        document.querySelector('#result').style.display = 'flex'; // Change to flex to show
        document.getElementById('loadingSpinner').style.display = 'none'; // Hide spinner after calculation


        // Prepare for chart display
        const ctxLine = document.getElementById('fdGrowthChart').getContext('2d');
        document.getElementById('fdGrowthChart').style.display = 'block';

        // Check if the chart exists and destroy it
        if (window.fdGrowthChart && window.fdGrowthChart.destroy) {
            window.fdGrowthChart.destroy();
        }

        // Example data for the line chart
        const labels = [];
        const dataPoints = [];

        // Generate labels and data points based on the selected tenure unit
        if (tenureUnit === 'months') {
            for (let i = 1; i <= totalMonths; i++) {
                labels.push(`Month ${i}`);
                const growth = Math.round(principal * (Math.pow((1 + (rate / 100) / 12), i))); // Monthly compounding
                dataPoints.push(growth);
            }
        } else { // tenureUnit === 'years'
            for (let i = 1; i <= years; i++) {
                labels.push(`Year ${i}`);
                const growth = Math.round(principal * (Math.pow((1 + (rate / 100)), i))); // Yearly compounding
                dataPoints.push(growth);
            }
        }

        // Create a new line chart instance
        window.fdGrowthChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'FD Growth',
                    data: dataPoints,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    fill: false,
                    lineTension: 0 // Set tension to 0 for straight lines
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                elements: {
                    line: {
                        tension: 0 // Ensure the line is straight
                    }
                }
            }
        });

        // Prepare for pie chart display
        const ctxPie = document.getElementById('fdPieChart').getContext('2d');
        document.getElementById('fdPieChart').style.display = 'block';

        // Check if the pie chart exists and destroy it
        if (window.fdPieChart && window.fdPieChart.destroy) {
            window.fdPieChart.destroy();
        }

        // Create pie chart data
        const pieData = {
            labels: ['Initial Amount', 'Total Interest'],
            datasets: [{
                data: [principal, interest],
                backgroundColor: ['#3498db', '#2ecc71']
            }]
        };

        // Create a new pie chart instance
        window.fdPieChart = new Chart(ctxPie, {
            type: 'pie',
            data: pieData,
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }, 500); // Simulate a loading time of 0.5 seconds
});
