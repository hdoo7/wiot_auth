function toggleChildren(element) {
    // Toggle the visibility of children or article info when clicked
    const children = element.querySelector('ul');
    const description = element.querySelector('.description');
    
    if (children) {
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
        description.style.display = description.style.display === 'none' ? 'block' : 'none';
    } else {
        const articleInfo = element.querySelector('.article-info');
        articleInfo.style.display = articleInfo.style.display === 'none' ? 'block' : 'none';
        description.style.display = description.style.display === 'none' ? 'block' : 'none';
    }
}
