window.onload = function () {
    const chartContainer = document.getElementById('chart-container');
    const dropdown = document.createElement('select');
    dropdown.id = 'groupBy';
    dropdown.innerHTML = `
        <option value="year" selected>Year</option>
        <option value="category">Category</option>
    `;
    document.body.insertBefore(dropdown, chartContainer);

    dropdown.addEventListener('change', function () {
        location.reload();
    });

    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            console.log("CSV Data Loaded:", results.data);
            const groupBy = document.getElementById('groupBy').value;
            processData(results.data, groupBy);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

    let chartInstance = null;

    function processData(data, groupBy) {
        let groupedData;
        if (groupBy === 'year') {
            groupedData = groupByYear(data);
        } else {
            groupedData = groupByCategory(data);
        }
        renderChart(groupedData, groupBy, data);
    }

    function groupByYear(data) {
        const years = data.map(item => item.date).filter(year => year && !isNaN(year)).map(Number);
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
        return uniqueYears.map(year => ({
            label: year,
            count: years.filter(y => y === year).length
        }));
    }

    function groupByCategory(data) {
        const categories = [...new Set(data.map(item => item.category))];
        return categories.map(category => ({
            label: category,
            count: data.filter(item => item.category === category).length
        }));
    }

    function renderChart(groupedData, groupBy, data) {
        if (groupedData.length > 0) {
            const ctx = document.getElementById('chart').getContext('2d');
            console.log("Canvas Context:", ctx);
            if (!ctx) {
                console.error("Canvas context not found");
                return;
            }

            if (chartInstance) {
                chartInstance.destroy();
            }

            chartInstance = new Chart(ctx, {
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
                        const activePoints = chartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                        if (activePoints.length > 0) {
                            const clickedLabel = groupedData[activePoints[0].index].label;
                            if (groupBy === 'year') {
                                displayGroupList(getCategoryData(data, clickedLabel), clickedLabel);
                            } else {
                                displayGroupList(getSubcategoryData(data, clickedLabel), clickedLabel);
                            }
                        }
                    }
                }
            });
        } else {
            console.error("No valid data available for plotting.");
        }
    }

    function getCategoryData(data, year) {
        const categoryData = {};
        data.filter(item => Number(item.date) === Number(year)).forEach(item => {
            if (!categoryData[item.category]) {
                categoryData[item.category] = { count: 0, sub_groups: {} };
            }
            categoryData[item.category].count += 1;
    
            if (!categoryData[item.category].sub_groups[item.subcategory]) {
                categoryData[item.category].sub_groups[item.subcategory] = { count: 0, instances: [] };
            }
            categoryData[item.category].sub_groups[item.subcategory].count += 1;
            categoryData[item.category].sub_groups[item.subcategory].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return categoryData;
    }    

    function getSubcategoryData(data, category) {
        const subcategoryData = {};
        data.filter(item => item.category === category).forEach(item => {
            if (!subcategoryData[item.subcategory]) {
                subcategoryData[item.subcategory] = { count: 0, instances: [] };
            }
            subcategoryData[item.subcategory].count += 1;
            subcategoryData[item.subcategory].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return subcategoryData;
    }
};
