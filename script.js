window.onload = function () {
    let currentGroup = "year";
    let chart = null;

    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            window.data = results.data;
            processData(window.data);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

    document.getElementById('group-by').addEventListener('change', function (e) {
        currentGroup = e.target.value;
        processData(window.data);
    });

    function processData(data) {
        let groupCount = currentGroup === "year" ? getYearCount(data) : getCategoryCount(data);

        if (chart) {
            chart.destroy();
        }

        const ctx = document.getElementById('chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: groupCount.map(item => item[currentGroup]),
                datasets: [{
                    label: `Publications by ${currentGroup.charAt(0).toUpperCase() + currentGroup.slice(1)}`,
                    data: groupCount.map(item => item.count),
                    backgroundColor: 'rgba(54, 162, 235, 0.3)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                onClick: function (e) {
                    const activePoints = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                    if (activePoints.length > 0) {
                        const clickedItem = groupCount[activePoints[0].index];
                        displayCategoryList(getCategoriesForYear(data, clickedItem.year), clickedItem.year);
                    }
                }
            }
        });
    }

    function getYearCount(data) {
        return [...new Set(data.map(item => item.year))]
            .sort()
            .map(year => ({
                year,
                count: data.filter(item => item.year === year).length
            }));
    }

    function getCategoriesForYear(data, year) {
        const categories = {};
        data.filter(item => item.year === year).forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = [];
            }
            categories[item.category].push(item.subcategory);
        });
        return categories;
    }

    function displayCategoryList(categoryData, year) {
        const listDiv = document.getElementById('group-list');
        listDiv.innerHTML = `<h3>Categories for Year ${year}:</h3>`;
        const list = document.createElement('ul');
        Object.keys(categoryData).forEach(category => {
            const item = document.createElement('li');
            item.textContent = category;
            item.style.cursor = "pointer";
            item.addEventListener("click", function () {
                displaySubcategoryList(categoryData[category], category);
            });
            list.appendChild(item);
        });
        listDiv.appendChild(list);
    }

    function displaySubcategoryList(subcategories, category) {
        const listDiv = document.getElementById('group-list');
        listDiv.innerHTML = `<h3>Subcategories for Category ${category}:</h3>`;
        const list = document.createElement('ul');
        subcategories.forEach(subcategory => {
            const item = document.createElement('li');
            item.textContent = subcategory;
            item.style.cursor = "pointer";
            item.addEventListener("click", function () {
                displayInstances(subcategory);
            });
            list.appendChild(item);
        });
        listDiv.appendChild(list);
    }

    function displayInstances(subcategory) {
        const instances = window.data.filter(item => item.subcategory === subcategory);
        const listDiv = document.getElementById('group-list');
        listDiv.innerHTML = `<h3>Instances for Subcategory ${subcategory}:</h3>`;
        
        const table = document.createElement('table');
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        ['Title', 'Authors', 'URL'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            th.style.border = "1px solid #ddd";
            th.style.padding = "8px";
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        instances.forEach(instance => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="border: 1px solid #ddd; padding: 8px;">${instance.title || "No Title"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${instance.authors || "Unknown Authors"}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">
                    <a href="${instance.url || "#"}" target="_blank">[Link]</a>
                </td>
            `;
            tbody.appendChild(row);
        });
        table.appendChild(tbody);
        listDiv.appendChild(table);
    }
};
