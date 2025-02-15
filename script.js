// Function to load and parse the CSV file
function loadCSVData(filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            parseCSVData(data);
        })
        .catch(error => console.error('Error loading CSV:', error));
}

// Function to parse CSV and generate tree structure
function parseCSVData(csvData) {
    Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            const treeData = groupData(results.data);
            buildTree(treeData);
        }
    });
}

// Function to group the data by "group" and "sub_group"
function groupData(data) {
    const grouped = {};

    data.forEach(row => {
        const { group, sub_group, title, authors, date, publisher, url } = row;

        if (!grouped[group]) {
            grouped[group] = [];
        }

        const article = {
            sub_group,
            title,
            authors,
            date,
            publisher,
            url
        };

        grouped[group].push(article);
    });

    return grouped;
}

// Function to dynamically build the tree structure
function buildTree(treeData) {
    const treeContainer = document.getElementById('tree');

    for (const group in treeData) {
        const parentNode = createNode(group, 'parent-node');
        const childList = document.createElement('ul');

        treeData[group].forEach(article => {
            const childNode = createNode(article.sub_group, 'child-node');
            const articleInfo = document.createElement('ul');
            articleInfo.classList.add('article-info');
            
            const articleDetails = `
                <li>Title: ${article.title}</li>
                <li>Authors: ${article.authors}</li>
                <li>Date: ${article.date}</li>
                <li>Publisher: <a href="${article.url}" target="_blank">${article.publisher}</a></li>
            `;
            articleInfo.innerHTML = articleDetails;

            childNode.addEventListener('click', function() {
                toggleVisibility(articleInfo);
            });

            childNode.appendChild(articleInfo);
            childList.appendChild(childNode);
        });

        parentNode.appendChild(childList);
        treeContainer.appendChild(parentNode);
    }
}

// Function to create a tree node (parent or child)
function createNode(label, className) {
    const node = document.createElement('li');
    node.classList.add('node');

    const span = document.createElement('span');
    span.classList.add(className);
    span.textContent = label;
    node.appendChild(span);

    const description = document.createElement('div');
    description.classList.add('description');
    description.textContent = 'Click to expand and view details.';
    node.appendChild(description);

    return node;
}

// Function to toggle visibility of child nodes or article info
function toggleVisibility(element) {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
}

// Load the CSV data from the given file path
loadCSVData('../data/scholar_results.csv');
