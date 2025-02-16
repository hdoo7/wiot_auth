window.onload = function () {
    const dropdown = document.createElement("select");
    dropdown.innerHTML = `
        <option value="year" selected>Year</option>
        <option value="category">Category</option>
    `;
    dropdown.style.margin = "10px";
    dropdown.style.padding = "5px";
    dropdown.style.fontSize = "16px";
    document.body.insertBefore(dropdown, document.body.firstChild);
    
    dropdown.addEventListener("change", function () {
        loadChart(this.value);
    });
    
    loadChart("year");
    
    function loadChart(groupBy) {
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
        let labels, counts, labelField;

        if (groupBy === "year") {
            const years = data.map(item => item.year).filter(year => year && !isNaN(year)).map(Number);
            const uniqueYears = [...new Set(years)].sort((a, b) => a - b);
            
            const yearCount = uniqueYears.map(year => ({
                label: year,
                count: years.filter(y => y === year).length
            }));
            
            labels = yearCount.map(item => item.label);
            counts = yearCount.map(item => item.count);
            labelField = "Year";
        } else {
            const categoryCounts = {};
            data.forEach(item => {
                if (!categoryCounts[item.group]) {
                    categoryCounts[item.group] = 0;
                }
                categoryCounts[item.group] += 1;
            });
            
            labels = Object.keys(categoryCounts);
            counts = Object.values(categoryCounts);
            labelField = "Category";
        }
        
        const ctx = document.getElementById('chart').getContext('2d');
        if (window.chartInstance) {
            window.chartInstance.destroy();
        }
        window.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: `Count by ${labelField}`,
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
                    const activePoints = window.chartInstance.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                    if (activePoints.length > 0) {
                        const clickedLabel = labels[activePoints[0].index];
                        if (groupBy === "year") {
                            displayGroupList(getGroupData(data, clickedLabel), clickedLabel);
                        } else {
                            displaySubGroups(data, clickedLabel);
                        }
                    }
                }
            }
        });
    }
    
    function displaySubGroups(data, category) {
        const filteredData = data.filter(item => item.group === category);
        const subGroups = {};

        filteredData.forEach(item => {
            if (!subGroups[item.sub_group]) {
                subGroups[item.sub_group] = [];
            }
            subGroups[item.sub_group].push(item);
        });

        displayGroupList(subGroups, category);
    }
    
    function displayGroupList(groupData, label) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>Publications for ${label}:</h3>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        
        Object.entries(groupData).forEach(([group, items]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${group}</strong> (${items.length})`;
            groupItem.style.cursor = "pointer";
            groupItem.addEventListener("click", function () {
                toggleTable(groupItem, items);
            });
            list.appendChild(groupItem);
        });
        
        groupListDiv.appendChild(list);
    }
    
    function toggleTable(groupItem, instances) {
        let existingTable = groupItem.querySelector("table");
        if (existingTable) {
            existingTable.remove();
        } else {
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr><th>Title</th><th>Authors</th><th>URL</th></tr>
                </thead>
                <tbody>
                    ${instances.map(instance => `
                        <tr>
                            <td>${instance.title}</td>
                            <td>${instance.authors}</td>
                            <td><a href="${instance.url}" target="_blank">[Link]</a></td>
                        </tr>
                    `).join('')}
                </tbody>
            `;
            groupItem.appendChild(table);
        }
    }
};
