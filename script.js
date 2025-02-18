window.onload = function () {
    const groupBySelect = document.createElement('select');
    groupBySelect.innerHTML = `
        <option value="year" selected>Year</option>
        <option value="category">Category</option>
    `;
    document.body.insertBefore(groupBySelect, document.getElementById('chart'));

    groupBySelect.addEventListener('change', function () {
        fetchDataAndRenderChart(this.value);
    });

    fetchDataAndRenderChart('year');

    function fetchDataAndRenderChart(groupBy) {
        Papa.parse("merged_results.csv", {
            download: true,
            header: true,
            dynamicTyping: true,
            complete: function (results) {
                processData(results.data, groupBy);
            },
            error: function (error) {
                console.error("Error parsing CSV:", error);
            }
        });
    }

    function processData(data, groupBy) {
        let groupedData;

        if (groupBy === 'year') {
            const years = data.map(item => item.year).filter(year => year && !isNaN(year)).map(Number);
            const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

            groupedData = uniqueYears.map(year => ({
                label: year,
                count: years.filter(y => y === year).length
            }));
        } else {
            const categories = data.map(item => item.category).filter(category => category);
            const uniqueCategories = [...new Set(categories)];

            groupedData = uniqueCategories.map(category => ({
                label: category,
                count: categories.filter(c => c === category).length
            }));
        }

        renderChart(groupedData, data, groupBy);
    }

    function renderChart(groupedData, data, groupBy) {
        const ctx = document.getElementById('chart').getContext('2d');
        if (window.myChart) {
            window.myChart.destroy();
        }
        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: groupedData.map(item => item.label),
                datasets: [{
                    label: `Count by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}`,
                    data: groupedData.map(item => item.count),
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
                    const activePoints = window.myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                    if (activePoints.length > 0) {
                        const clickedLabel = groupedData[activePoints[0].index].label;
                        displayGroupList(getGroupData(data, clickedLabel, groupBy), clickedLabel, groupBy);
                    }
                }
            }
        });
    }

    function getGroupData(data, label, groupBy) {
        const groupData = {};
        data.filter(item => item[groupBy] === label).forEach(item => {
            if (!groupData[item.subcategory]) {
                groupData[item.subcategory] = { count: 0, instances: [] };
            }
            groupData[item.subcategory].count += 1;
            groupData[item.subcategory].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return groupData;
    }

    function displayGroupList(groupData, label, groupBy) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3 style="color: #333; font-weight: 500;">Publications for ${label}:</h3>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        list.style.padding = "0";
        list.style.margin = "0";

        Object.entries(groupData).forEach(([subCategory, data]) => {
            const subCategoryItem = document.createElement('li');
            subCategoryItem.innerHTML = `<strong style="color: #333; font-size: 16px; font-weight: 500;">${subCategory}</strong> (${data.count})`;
            subCategoryItem.style.cursor = "pointer";
            subCategoryItem.style.padding = "6px 20px";
            subCategoryItem.style.margin = "8px 0";
            subCategoryItem.style.backgroundColor = "#f7f7f7";
            subCategoryItem.style.borderRadius = "12px";
            subCategoryItem.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.05)";
            subCategoryItem.style.transition = "background-color 0.3s ease";
            subCategoryItem.addEventListener("click", function () {
                toggleTable(subCategoryItem, data.instances);
            });

            subCategoryItem.addEventListener("mouseenter", () => {
                subCategoryItem.style.backgroundColor = "#e1e1e1";
            });
            subCategoryItem.addEventListener("mouseleave", () => {
                subCategoryItem.style.backgroundColor = "#f7f7f7";
            });

            list.appendChild(subCategoryItem);
        });

        groupListDiv.appendChild(list);
    }
};
