// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Determine unique filters
    const programs = [...new Set(examplesData.map(ex => ex.program))].sort();
    const areas = [...new Set(examplesData.map(ex => ex.area))].sort();

    // State
    const state = {
        selectedPrograms: new Set(),
        selectedAreas: new Set()
    };

    const programFiltersContainer = document.getElementById('program-filters');
    const areaFiltersContainer = document.getElementById('area-filters');
    const cardsGrid = document.getElementById('cards-grid');
    const resultsCount = document.getElementById('results-count');
    const resetBtn = document.getElementById('reset-filters');

    // Initialization
    function init() {
        renderFilterCheckboxes(programs, programFiltersContainer, 'program');
        renderFilterCheckboxes(areas, areaFiltersContainer, 'area');
        renderCards();

        resetBtn.addEventListener('click', () => {
            state.selectedPrograms.clear();
            state.selectedAreas.clear();
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            renderCards();
        });
    }

    // Render Filter Checkboxes
    function renderFilterCheckboxes(options, container, type) {
        options.forEach(option => {
            const label = document.createElement('label');
            label.className = 'filter-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = option;
            
            checkbox.addEventListener('change', (e) => {
                const targetSet = type === 'program' ? state.selectedPrograms : state.selectedAreas;
                if (e.target.checked) {
                    targetSet.add(option);
                } else {
                    targetSet.delete(option);
                }
                renderCards();
            });

            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(option));
            container.appendChild(label);
        });
    }

    // Render Cards
    function renderCards() {
        cardsGrid.innerHTML = '';

        const filteredData = examplesData.filter(ex => {
            const programMatch = state.selectedPrograms.size === 0 || state.selectedPrograms.has(ex.program);
            const areaMatch = state.selectedAreas.size === 0 || state.selectedAreas.has(ex.area);
            return programMatch && areaMatch;
        });

        resultsCount.textContent = `Showing ${filteredData.length} Example${filteredData.length !== 1 ? 's' : ''}`;

        filteredData.forEach(ex => {
            const card = document.createElement('div');
            card.className = 'card';
            
            card.innerHTML = `
                <div class="card-tags">
                    <span class="tag tag-program">${ex.program}</span>
                    <span class="tag tag-area">${ex.area}</span>
                </div>
                <h3>${ex.courseName}</h3>
                <div class="card-course-code">${ex.courseCode}</div>
                
                <div class="objective-box">
                    <p>${ex.objective}</p>
                </div>
                
                <p style="margin-bottom: 1.5rem;"><strong>How AI Enhances This:</strong> ${ex.enhancement}</p>
                
                <div class="comparison-box">
                    <div class="comparison-row">
                        <span class="badge-old">THE OLD WAY</span>
                        <p>${ex.oldWay}</p>
                    </div>
                    <div class="comparison-row">
                        <span class="badge-new">THE AI CLUSTER WAY</span>
                        <p>${ex.newWay}</p>
                    </div>
                </div>
            `;
            
            cardsGrid.appendChild(card);
        });
    }

    // Start App
    init();
});
