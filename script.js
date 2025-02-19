window.onload = function () {
    let currentGroup = "year"; // Default group is by Year
    let chart = null; // To hold the chart instance

    Papa.parse("merged_results.csv", {
        download: true,
        header: true,
        dynamicTyping: true,
        complete: function (results) {
            window.data = results.data; // Store data globally for later use
            processData(window.data);
        },
        error: function (error) {
            console.error("Error parsing CSV:", error);
        }
    });

    document.getElementById('group-by').addEventListener('change', function (e) {
        currentGroup = e.target.value;
        processData(window.data); // Reprocess the data whenever the group changes
    });

    function processData(data) {
        let groupCount = currentGroup === "year" ? getYearCount(data) : getCategoryCount(data);
        
        if (chart) chart.destroy();
        
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
                        displayGroupList(getGroupData(data, clickedItem), currentGroup);
                    }
                }
            }
        });
    }

    function getYearCount(data) {
        return [...new Set(data.map(item => item.year))]
            .filter(year => year)
            .sort()
            .map(year => ({ year, count: data.filter(item => item.year === year).length }));
    }

    function getCategoryCount(data) {
        return [...new Set(data.map(item => item.category))]
            .filter(category => category)
            .sort()
            .map(category => ({ category, count: data.filter(item => item.category === category).length }));
    }

    function getGroupData(data, groupItem) {
        const groupData = {};
        if (currentGroup === "category") {
            data.filter(item => item.category === groupItem.category).forEach(item => {
                if (!groupData[item.subcategory]) {
                    groupData[item.subcategory] = { count: 0, instances: [] };
                }
                groupData[item.subcategory].count += 1;
                groupData[item.subcategory].instances.push(item);
            });
        } else if (currentGroup === "year") {
            data.forEach(item => {
                if (!groupData[item.category]) {
                    groupData[item.category] = { count: 0, subcategories: {} };
                }
                groupData[item.category].count += 1;
                if (!groupData[item.category].subcategories[item.subcategory]) {
                    groupData[item.category].subcategories[item.subcategory] = { count: 0, instances: [] };
                }
                groupData[item.category].subcategories[item.subcategory].count += 1;
                groupData[item.category].subcategories[item.subcategory].instances.push(item);
            });
        }
        return groupData;
    }

    function displayGroupList(groupData, groupType) {
        const groupListDiv = document.getElementById('group-list');
        if (!groupListDiv.innerHTML) {
            groupListDiv.innerHTML = `<h3>Publications by ${groupType.charAt(0).toUpperCase() + groupType.slice(1)}:</h3>`;
        }
        const list = document.createElement('ul');
        list.style.listStyleType = "none";

        Object.entries(groupData).forEach(([key, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${key}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.addEventListener("click", function () {
                if (groupType === "year") {
                    displayGroupList(data.subcategories, "subcategory");
                } else {
                    toggleTable(groupItem, data.instances);
                }
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
            table.style.width = "80%";

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
                        <a href="${instance.url}" target="_blank">[Link]</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);
            groupItem.appendChild(table);
        }
    }
};
