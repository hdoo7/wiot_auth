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
        let groupCount;
        if (currentGroup === "year") {
            groupCount = getYearCount(data);
        } else {
            groupCount = getCategoryCount(data);
        }

        if (chart) {
            chart.destroy();
        }

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
                            displayGroupListByYear(getGroupData(data, clickedItem.year), clickedItem.year);
                        } else {
                            displayGroupListByCategory(getSubcategoriesByCategory(data, clickedItem.interaction_models), "interaction_models", clickedItem.interaction_models);
                        }
                    }
                }
            }
        });
    }

    function getGroupData(data, year) {
        const groupData = {};
        data.filter(item => item.year === year).forEach(item => {
            if (!groupData[item.interaction_models]) {
                groupData[item.interaction_models] = { count: 0, sub_groups: {} };
            }
            groupData[item.interaction_models].count += 1;

            if (!groupData[item.interaction_models].sub_groups[item.modalities]) {
                groupData[item.interaction_models].sub_groups[item.modalities] = { count: 0, instances: [] };
            }
            groupData[item.interaction_models].sub_groups[item.modalities].count += 1;
            groupData[item.interaction_models].sub_groups[item.modalities].instances.push({
                title: item.title || "No Title",
                authors: item.authors || "Unknown Authors",
                url: item.url || "#"
            });
        });
        return groupData;
    }

    function displayGroupListByYear(groupData, year) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>Publications for ${year}:</h3>`;

        const list = document.createElement('ul');
        list.style.listStyleType = "none";
        
        Object.entries(groupData).forEach(([interaction_models, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${interaction_models}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.addEventListener("click", function () {
                toggleSubGroups(groupItem, data.sub_groups);
            });
            list.appendChild(groupItem);
        });

        groupListDiv.appendChild(list);
    }

    function toggleSubGroups(groupItem, subGroups) {
        let existingList = groupItem.querySelector("ul");
        if (existingList) {
            existingList.remove();
        } else {
            const subGroupList = document.createElement('ul');
            
            Object.entries(subGroups).forEach(([modalities, data]) => {
                const subGroupItem = document.createElement('li');
                subGroupItem.innerHTML = `<strong>${modalities}</strong> (${data.count})`;
                subGroupItem.style.cursor = "pointer";
                subGroupItem.addEventListener("click", function (event) {
                    event.stopPropagation();
                    toggleTable(subGroupItem, data.instances);
                });
                subGroupList.appendChild(subGroupItem);
            });

            groupItem.appendChild(subGroupList);
        }
    }

    function toggleTable(subGroupItem, instances) {
        let existingTable = subGroupItem.querySelector("table");
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
                    <td style="border: 1px solid #ddd; padding: 8px;">${instance.title}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${instance.authors}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">
                        <a href="${instance.url}" target="_blank">[Link]</a>
                    </td>
                `;
                tbody.appendChild(row);
            });
            table.appendChild(tbody);

            subGroupItem.appendChild(table);
        }
    }
    

    function getYearCount(data) {
        return [...new Set(data.map(item => item.year).filter(year => year))]
            .sort()
            .map(year => ({
                year,
                count: data.filter(item => item.year === year).length
            }));
    }

    function getCategoryCount(data) {
        return [...new Set(data.map(item => item.interaction_models).filter(interaction_models => interaction_models))]
            .sort()
            .map(interaction_models => ({
                interaction_models,
                count: data.filter(item => item.interaction_models === interaction_models).length
            }));
    }

    function getSubcategoriesByCategory(data, interaction_models) {
        const subcategories = {};
        data.filter(item => item.interaction_models === interaction_models).forEach(item => {
            if (!subcategories[item.modalities]) {
                subcategories[item.modalities] = { count: 0 };
            }
            subcategories[item.modalities].count += 1;
        });
        return subcategories;
    }

    function getInstancesByModalities(data, modalities) {
        return data.filter(item => item.modalities === modalities).map(item => ({
            title: item.title || "No Title",
            authors: item.authors || "Unknown Authors",
            url: item.url || "#"
        }));
    }

    function displayGroupListByCategory(groupData, interaction_models) {
        const groupListDiv = document.getElementById('group-list');
        groupListDiv.innerHTML = `<h3>Publications for ${interaction_models}:</h3>`;
        const list = document.createElement('ul');
        list.style.listStyleType = "none";

        Object.entries(groupData).forEach(([key, data]) => {
            const groupItem = document.createElement('li');
            groupItem.innerHTML = `<strong>${key}</strong> (${data.count})`;
            groupItem.style.cursor = "pointer";
            groupItem.addEventListener("click", function () {
                displayInstanceTable(groupItem, getInstancesByModalities(window.data, key));
            });
            list.appendChild(groupItem);
        });

        groupListDiv.appendChild(list);
    }

    function displayInstanceTable(groupItem, instances) {
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
                    <td style="border: 1px solid #ddd; padding: 8px;">${instance.title}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${instance.authors}</td>
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

    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
