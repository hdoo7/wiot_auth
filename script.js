window.onload = function () {
    const dropdown = document.getElementById('groupByDropdown');
    dropdown.addEventListener('change', function () {
        loadChart(this.value);
    });

    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            window.data = results.data;
            loadChart('Year'); // Default to Year
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });
};

function loadChart(groupBy) {
    const data = window.data;
    let labels = [], counts = [], datasetLabel;

    if (groupBy === 'Year') {
        const years = data.map(item => item.year).filter(year => year && !isNaN(year)).map(Number);
        const uniqueYears = [...new Set(years)].sort((a, b) => a - b);

        labels = uniqueYears;
        counts = labels.map(year => years.filter(y => y === year).length);
        datasetLabel = 'Count by Year';
    } else {
        const groups = data.map(item => item.group).filter(group => group);
        const uniqueGroups = [...new Set(groups)];

        labels = uniqueGroups;
        counts = labels.map(group => groups.filter(g => g === group).length);
        datasetLabel = 'Count by Category';
    }

    renderChart(labels, counts, datasetLabel, groupBy, data);
}

function renderChart(labels, counts, datasetLabel, groupBy, data) {
    const ctx = document.getElementById('chart').getContext('2d');
    if (window.myChart) window.myChart.destroy();
    
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: datasetLabel,
                data: counts,
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
                    const clickedLabel = labels[activePoints[0].index];
                    if (groupBy === 'Year') {
                        displayGroupList(getGroupData(data, 'year', clickedLabel), clickedLabel);
                    } else {
                        displayGroupList(getGroupData(data, 'group', clickedLabel), clickedLabel);
                    }
                }
            }
        }
    });
}

function getGroupData(data, type, value) {
    const filteredData = data.filter(item => item[type] === value);
    const groupData = {};

    filteredData.forEach(item => {
        if (!groupData[item.group]) {
            groupData[item.group] = { count: 0, sub_groups: {} };
        }
        groupData[item.group].count += 1;

        if (!groupData[item.group].sub_groups[item.sub_group]) {
            groupData[item.group].sub_groups[item.sub_group] = { count: 0, instances: [] };
        }
        groupData[item.group].sub_groups[item.sub_group].count += 1;
        groupData[item.group].sub_groups[item.sub_group].instances.push({
            title: item.title || "No Title",
            authors: item.authors || "Unknown Authors",
            year: item.year || "Unknown Year",
            url: item.url || "#"
        });
    });
    return groupData;
}
