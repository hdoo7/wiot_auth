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
        const groupCount = currentGroup === "year" ? getCount(data, "year") : getCount(data, "category");
        
        if (chart) chart.destroy();
        
        const ctx = document.getElementById('chart').getContext('2d');
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: groupCount.map(item => item[currentGroup]),
                datasets: [{
                    label: `Publications by ${capitalize(currentGroup)}`,
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
                        if (currentGroup === "year") {
                            displayGroupList(getGroupData(data, clickedItem.year), clickedItem.year);
                        } else {
                            displayGroupList(getSubcategoriesByCategory(data, clickedItem.category), clickedItem.category);
                        }
                    }
                }
            }
        });
    }

    function getCount(data, key) {
        return [...new Set(data.map(item => item[key]).filter(val => val))]
            .sort()
            .map(value => ({
                [key]: value,
                count: data.filter(item => item[key] === value).length
            }));
    }

    function getGroupData(data, year) {
        return groupDataByKey(data, "year", year, "category");
    }

    function getSubcategoriesByCategory(data, category) {
        return groupDataByKey(data, "category", category, "subcategory");
    }

    function groupDataByKey(data, filterKey, filterValue, groupKey) {
        const groupedData = {};
        data.filter(item => item[filterKey] === filterValue).forEach(item => {
            if (!groupedData[item[groupKey]]) {
                groupedData[item[groupKey]] = { count: 0, instances: [] };
            }
            groupedData[item[groupKey]].count += 1;
            groupedData[item[groupKey]].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return groupedData;
    }

    function displayGroupList(groupData, title) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3 style="font-size: 1.5em; font-weight: bold; color: #333;">Publications for ${title}:</h3>`;
        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        list.style.padding = "0";
    
        Object.entries(groupData).forEach(([key, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong style="color: #007BFF; cursor: pointer;">${key}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.style.marginBottom = "10px";
            groupItem.style.padding = "5px";
            groupItem.style.borderBottom = "1px solid #ddd";
            groupItem.addEventListener("click", function () {
                toggleTable(groupItem, data.instances);
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
            table.style.borderCollapse = "collapse";
            table.style.width = "90%";
            table.style.marginTop = "10px";
            table.style.border = "1px solid #ddd";

            const thead = document.createElement('thead');
            thead.style.backgroundColor = "#f8f9fa";
            thead.style.fontWeight = "bold";
            
            const headerRow = document.createElement('tr');
            ['Title', 'Authors', 'URL'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                th.style.border = "1px solid #ddd";
                th.style.padding = "10px";
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            instances.forEach(instance => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td style="border: 1px solid #ddd; padding: 10px;">${instance.title}</td>
                    <td style="border: 1px solid #ddd; padding: 10px;">${instance.authors}</td>
                    <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                        <a href="${instance.url}" target="_blank" style="color: #007BFF; text-decoration: none;">[Link]</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            groupItem.appendChild(table);
        }
    }

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
