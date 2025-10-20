// Gantt Chart Component for Project Timeline Visualization
class GanttChart {
    constructor(container, data) {
        this.container = container;
        this.data = data || this.generateSampleData();
        this.svg = null;
        
        // Dynamic sizing with proper edge padding and responsive scaling
        const containerRect = container.getBoundingClientRect();
        const viewportWidth = globalThis.innerWidth || 1200;
        
        // Responsive width - allow full container width
        this.width = Math.max(600, Math.min(1400, containerRect.width - 40));
        
        // Dynamic height based on number of tasks plus space for labels and legend
        const taskHeight = 40;
        const topMargin = 40;  // Space for month/year labels
        const bottomMargin = 60; // Space for legend
        this.height = Math.max(400, this.data.length * taskHeight + topMargin + bottomMargin);
        
        // Dynamic margins - ensure task labels have enough space
        const isMobile = this.width < 600;
        this.margin = { 
            top: topMargin, 
            right: 40, 
            bottom: bottomMargin, 
            left: isMobile ? 140 : 180  // More space for task labels
        };
        
        this.init();
    }
    
    generateSampleData() {
        return [
            {
                name: "Project Planning",
                start: new Date('2024-01-01'),
                end: new Date('2024-01-15'),
                progress: 100,
                color: '#4CAF50'
            },
            {
                name: "Hardware Design",
                start: new Date('2024-01-10'),
                end: new Date('2024-02-28'),
                progress: 80,
                color: '#2196F3'
            },
            {
                name: "PCB Layout",
                start: new Date('2024-02-15'),
                end: new Date('2024-03-15'),
                progress: 60,
                color: '#FF9800'
            },
            {
                name: "Component Sourcing",
                start: new Date('2024-03-01'),
                end: new Date('2024-03-20'),
                progress: 40,
                color: '#9C27B0'
            },
            {
                name: "Assembly & Testing",
                start: new Date('2024-03-15'),
                end: new Date('2024-04-30'),
                progress: 20,
                color: '#F44336'
            },
            {
                name: "Software Development",
                start: new Date('2024-02-01'),
                end: new Date('2024-05-15'),
                progress: 30,
                color: '#607D8B'
            }
        ];
    }
    
    init() {
        this.container.innerHTML = '';
        
        // Create SVG with proper viewBox for responsive scaling
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '100%');
        this.svg.setAttribute('viewBox', `0 0 ${this.width} ${this.height}`);
        this.svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
        this.svg.style.display = 'block';
        this.svg.style.maxWidth = '100%';
        
        this.container.appendChild(this.svg);
        
        this.render();
    }
    
    render() {
        const chartWidth = this.width - this.margin.left - this.margin.right;
        const chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        // Calculate time scale with padding for better visual spacing
        const minDate = Math.min(...this.data.map(d => d.start.getTime()));
        const maxDate = Math.max(...this.data.map(d => d.end.getTime()));
        const timeRange = maxDate - minDate;
        
        // Add 5% padding on each side for better visual spacing
        const timePadding = timeRange * 0.05;
        const paddedMinDate = minDate - timePadding;
        const paddedMaxDate = maxDate + timePadding;
        const paddedTimeRange = paddedMaxDate - paddedMinDate;
        
        // Add grid lines for months
        this.addGridLines(paddedMinDate, paddedMaxDate, chartWidth, chartHeight);
        
        // Create bars for each task
        this.data.forEach((task, index) => {
            const y = this.margin.top + (index * (chartHeight / this.data.length));
            const barHeight = Math.max(24, chartHeight / this.data.length - 12);
            
            // Calculate bar position and width using padded time range
            const startX = this.margin.left + ((task.start.getTime() - paddedMinDate) / paddedTimeRange) * chartWidth;
            const endX = this.margin.left + ((task.end.getTime() - paddedMinDate) / paddedTimeRange) * chartWidth;
            const barWidth = endX - startX;
            
            // Calculate completed and remaining widths
            const completedWidth = barWidth * (task.progress / 100);
            const remainingWidth = barWidth - completedWidth;
            
            // Create completed segment (yellow/gold)
            if (completedWidth > 0) {
                const completedBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                completedBar.setAttribute('x', startX);
                completedBar.setAttribute('y', y);
                completedBar.setAttribute('width', completedWidth);
                completedBar.setAttribute('height', barHeight);
                completedBar.setAttribute('class', 'gantt-task-bar-completed');
                completedBar.setAttribute('rx', '2');
                this.svg.appendChild(completedBar);
            }
            
            // Create remaining segment (orange)
            if (remainingWidth > 0) {
                const remainingBar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                remainingBar.setAttribute('x', startX + completedWidth);
                remainingBar.setAttribute('y', y);
                remainingBar.setAttribute('width', remainingWidth);
                remainingBar.setAttribute('height', barHeight);
                remainingBar.setAttribute('class', 'gantt-task-bar-remaining');
                remainingBar.setAttribute('rx', '2');
                this.svg.appendChild(remainingBar);
            }
            
            // Add task label with responsive font size and positioning
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', this.margin.left - 10);
            label.setAttribute('y', y + barHeight / 2 + 5);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('class', 'gantt-task-label');
            
            // Truncate text for mobile
            const maxChars = this.width < 600 ? 15 : (this.width < 800 ? 18 : 25);
            label.textContent = this.truncateText(task.name, maxChars);
            this.svg.appendChild(label);
        });
        
        // Add time axis
        this.addTimeAxis(paddedMinDate, paddedMaxDate, chartWidth);
        
        // Add legend at bottom
        this.addLegend(chartHeight);
    }
    
    addGridLines(minDate, maxDate, chartWidth, chartHeight) {
        // Add vertical grid lines for each month - align with chart data range
        const startDate = new Date(minDate);
        const endDate = new Date(maxDate);
        const timeRange = maxDate - minDate;
        
        // Start from the first month in the data range
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        while (currentDate <= endDate) {
            // Calculate position within the padded time range
            const x = this.margin.left + ((currentDate.getTime() - minDate) / timeRange) * chartWidth;
            
            // Only draw grid lines that are within the chart area
            if (x >= this.margin.left && x <= this.margin.left + chartWidth) {
                // Draw vertical grid line
                const gridLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                gridLine.setAttribute('x1', x);
                gridLine.setAttribute('y1', this.margin.top);
                gridLine.setAttribute('x2', x);
                gridLine.setAttribute('y2', this.height - this.margin.bottom);
                gridLine.setAttribute('class', 'gantt-grid-line');
                this.svg.appendChild(gridLine);
            }
            
            // Move to next month
            currentDate.setMonth(currentDate.getMonth() + 1);
        }
    }
    
    addTimeAxis(minDate, maxDate, chartWidth) {
        // Add month labels along the top
        const startDate = new Date(minDate);
        const endDate = new Date(maxDate);
        const timeRange = maxDate - minDate;
        
        let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
        
        while (currentDate <= endDate) {
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            const monthEnd = nextMonth > endDate ? endDate : nextMonth;
            
            const startX = this.margin.left + ((currentDate.getTime() - minDate) / timeRange) * chartWidth;
            const endX = this.margin.left + ((monthEnd.getTime() - minDate) / timeRange) * chartWidth;
            const centerX = (startX + endX) / 2;
            
            // Only add labels if they're within the chart area
            if (centerX >= this.margin.left && centerX <= this.margin.left + chartWidth) {
                // Add month name at top
                const monthLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                monthLabel.setAttribute('x', centerX);
                monthLabel.setAttribute('y', this.margin.top - 10);
                monthLabel.setAttribute('text-anchor', 'middle');
                monthLabel.setAttribute('class', 'gantt-month-label');
                monthLabel.textContent = currentDate.toLocaleDateString('en-US', { month: 'short' });
                this.svg.appendChild(monthLabel);
                
                // Add year label underneath month
                const yearLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                yearLabel.setAttribute('x', centerX);
                yearLabel.setAttribute('y', this.margin.top - 1);
                yearLabel.setAttribute('text-anchor', 'middle');
                yearLabel.setAttribute('class', 'gantt-year-label');
                yearLabel.textContent = currentDate.getFullYear();
                this.svg.appendChild(yearLabel);
            }
            
            currentDate = nextMonth;
        }
    }
    
    addLegend(chartHeight) {
        const legendY = this.height - this.margin.bottom + 30;
        const legendStartX = this.margin.left;
        
        // Completed days legend
        const completedRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        completedRect.setAttribute('x', legendStartX);
        completedRect.setAttribute('y', legendY);
        completedRect.setAttribute('width', 20);
        completedRect.setAttribute('height', 14);
        completedRect.setAttribute('class', 'gantt-task-bar-completed');
        completedRect.setAttribute('rx', '2');
        this.svg.appendChild(completedRect);
        
        const completedText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        completedText.setAttribute('x', legendStartX + 28);
        completedText.setAttribute('y', legendY + 11);
        completedText.setAttribute('class', 'gantt-legend-text');
        completedText.textContent = 'Completed of Days';
        this.svg.appendChild(completedText);
        
        // Remaining days legend
        const remainingRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        remainingRect.setAttribute('x', legendStartX + 180);
        remainingRect.setAttribute('y', legendY);
        remainingRect.setAttribute('width', 20);
        remainingRect.setAttribute('height', 14);
        remainingRect.setAttribute('class', 'gantt-task-bar-remaining');
        remainingRect.setAttribute('rx', '2');
        this.svg.appendChild(remainingRect);
        
        const remainingText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        remainingText.setAttribute('x', legendStartX + 208);
        remainingText.setAttribute('y', legendY + 11);
        remainingText.setAttribute('class', 'gantt-legend-text');
        remainingText.textContent = 'Remaining of Days';
        this.svg.appendChild(remainingText);
    }
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
    }
}

// Global functions for new Gantt dropdown
function toggleGanttDropdown() {
    const dropdown = document.getElementById('gantt-dropdown');
    const toggle = document.querySelector('.gantt-toggle');
    const chartContainer = document.getElementById('gantt-chart');
    
    if (dropdown.classList.contains('open')) {
        closeGanttDropdown();
    } else {
        dropdown.classList.add('open');
        toggle.classList.add('active');
        
        // Initialize Gantt chart if not already done
        if (!chartContainer.hasChildNodes() || chartContainer.children.length === 0) {
            new GanttChart(chartContainer);
        }
        
        // Close when clicking outside
        setTimeout(() => {
            document.addEventListener('click', closeGanttOnClickOutside);
        }, 100);
    }
}

function closeGanttDropdown() {
    const dropdown = document.getElementById('gantt-dropdown');
    const toggle = document.querySelector('.gantt-toggle');
    
    dropdown.classList.remove('open');
    toggle.classList.remove('active');
    document.removeEventListener('click', closeGanttOnClickOutside);
}

function closeGanttOnClickOutside(event) {
    const dropdown = document.getElementById('gantt-dropdown');
    const toggle = document.querySelector('.gantt-toggle');
    
    if (!dropdown.contains(event.target) && !toggle.contains(event.target)) {
        closeGanttDropdown();
    }
}

// Legacy function for backwards compatibility
function toggleGantt() {
    toggleGanttDropdown();
}

// Initialize Gantt charts on page load
document.addEventListener('DOMContentLoaded', () => {
    const ganttContainers = document.querySelectorAll('.gantt-chart[data-auto-init="true"]');
    ganttContainers.forEach(container => {
        new GanttChart(container);
    });
    
    // Initialize Gantt chart in dropdown if it exists and has data
    const ganttDropdownChart = document.getElementById('gantt-chart');
    if (ganttDropdownChart) {
        try {
            const ganttDataAttr = ganttDropdownChart.getAttribute('data-gantt');
            let ganttData = null;
            
            if (ganttDataAttr && ganttDataAttr !== 'null') {
                ganttData = JSON.parse(ganttDataAttr);
                // Convert date strings to Date objects
                ganttData = ganttData.map(task => ({
                    ...task,
                    start: new Date(task.start),
                    end: new Date(task.end),
                    progress: task.progress || 0,
                    color: task.color || '#4CAF50'
                }));
            }
            
            new GanttChart(ganttDropdownChart, ganttData);
        } catch (error) {
            console.error('Error parsing Gantt data:', error);
            // Fall back to sample data
            new GanttChart(ganttDropdownChart);
        }
    }
});