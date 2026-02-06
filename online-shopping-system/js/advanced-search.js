// Advanced search and filtering functionality
const searchState = {
    selectedCategory: '',
    priceRange: '',
    selectedTags: new Set(),
    searchQuery: '',
    allTags: new Set()
};

// DOM Elements for advanced search
const searchElements = {
    advancedSearchInput: document.getElementById('advanced-search-input'),
    advancedSearchBtn: document.getElementById('advanced-search-btn'),
    categoryFilter: document.getElementById('category-filter'),
    priceFilter: document.getElementById('price-filter'),
    tagInput: document.getElementById('tag-input'),
    selectedTagsContainer: document.getElementById('selected-tags'),
    tagSuggestions: document.getElementById('tag-suggestions'),
    clearFiltersBtn: document.getElementById('clear-filters')
};

// Initialize advanced search
function initAdvancedSearch() {
    extractAllTags();
    populateCategories();
    setupSearchEventListeners();
}

// Extract all unique tags from products
function extractAllTags() {
    searchState.allTags.clear();
    
    if (!appState.products) return;
    
    appState.products.forEach(product => {
        if (product.tags && Array.isArray(product.tags)) {
            product.tags.forEach(tag => {
                if (typeof tag === 'string' && tag.trim()) {
                    searchState.allTags.add(tag.toLowerCase());
                }
            });
        }
    });
}

// Populate categories dropdown
function populateCategories() {
    if (!searchElements.categoryFilter) return;
    
    const categories = new Set();
    
    if (appState.products) {
        appState.products.forEach(product => {
            if (product.category) {
                categories.add(product.category);
            }
        });
    }
    
    // Clear existing options (keep "All Categories")
    while (searchElements.categoryFilter.options.length > 1) {
        searchElements.categoryFilter.remove(1);
    }
    
    // Add category options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        searchElements.categoryFilter.appendChild(option);
    });
}

// Setup search event listeners
function setupSearchEventListeners() {
    // Advanced search button
    if (searchElements.advancedSearchBtn) {
        searchElements.advancedSearchBtn.addEventListener('click', performAdvancedSearch);
    }
    
    // Enter key in search input
    if (searchElements.advancedSearchInput) {
        searchElements.advancedSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performAdvancedSearch();
            }
        });
    }
    
    // Category filter
    if (searchElements.categoryFilter) {
        searchElements.categoryFilter.addEventListener('change', (e) => {
            searchState.selectedCategory = e.target.value;
            performAdvancedSearch();
        });
    }
    
    // Price filter
    if (searchElements.priceFilter) {
        searchElements.priceFilter.addEventListener('change', (e) => {
            searchState.priceRange = e.target.value;
            performAdvancedSearch();
        });
    }
    
    // Tag input
    if (searchElements.tagInput) {
        searchElements.tagInput.addEventListener('input', showTagSuggestions);
        searchElements.tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchElements.tagInput.value.trim()) {
                addTag(searchElements.tagInput.value.trim());
                searchElements.tagInput.value = '';
                hideTagSuggestions();
                performAdvancedSearch();
            }
        });
    }
    
    // Clear filters button
    if (searchElements.clearFiltersBtn) {
        searchElements.clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (searchElements.tagSuggestions && searchElements.tagInput) {
            if (!searchElements.tagSuggestions.contains(e.target) && 
                !searchElements.tagInput.contains(e.target)) {
                hideTagSuggestions();
            }
        }
    });
}

// Perform advanced search
function performAdvancedSearch() {
    const query = searchElements.advancedSearchInput ? 
        searchElements.advancedSearchInput.value.toLowerCase().trim() : '';
    searchState.searchQuery = query;
    
    if (!appState.products) return;
    
    let filteredProducts = appState.products.filter(product => 
        product.status === 'active'
    );
    
    // Apply text search across multiple attributes
    if (query) {
        filteredProducts = filteredProducts.filter(product => {
            const searchableFields = [
                product.name,
                product.description,
                product.sku,
                product.brand,
                product.category,
                product.subcategory,
                product.detailedDescription
            ].filter(field => field).map(field => field.toLowerCase());
            
            // Search in tags
            const tags = product.tags ? product.tags.map(tag => tag.toLowerCase()) : [];
            
            return searchableFields.some(field => field.includes(query)) ||
                   tags.some(tag => tag.includes(query));
        });
    }
    
    // Apply category filter
    if (searchState.selectedCategory) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === searchState.selectedCategory
        );
    }
    
    // Apply price range filter
    if (searchState.priceRange) {
        const [min, max] = searchState.priceRange.split('-').map(Number);
        filteredProducts = filteredProducts.filter(product => {
            if (max) {
                return product.price >= min && product.price <= max;
            } else {
                return product.price >= min;
            }
        });
    }
    
    // Apply tag filter
    if (searchState.selectedTags.size > 0) {
        filteredProducts = filteredProducts.filter(product => {
            if (!product.tags || !Array.isArray(product.tags)) return false;
            
            const productTags = product.tags.map(tag => tag.toLowerCase());
            return Array.from(searchState.selectedTags).every(selectedTag => 
                productTags.includes(selectedTag)
            );
        });
    }
    
    // Update filtered products and render
    appState.filteredProducts = filteredProducts;
    appState.currentPage = 1;
    renderProducts();
    
    // Update search results count
    updateSearchResultsInfo(filteredProducts.length);
}

// Show tag suggestions
function showTagSuggestions() {
    if (!searchElements.tagInput || !searchElements.tagSuggestions) return;
    
    const input = searchElements.tagInput.value.toLowerCase().trim();
    
    if (!input) {
        hideTagSuggestions();
        return;
    }
    
    // Filter tags that match input and are not already selected
    const suggestions = Array.from(searchState.allTags).filter(tag => 
        tag.includes(input) && !searchState.selectedTags.has(tag)
    );
    
    if (suggestions.length === 0) {
        hideTagSuggestions();
        return;
    }
    
    searchElements.tagSuggestions.innerHTML = suggestions.map(tag => `
        <div class="tag-suggestion" data-tag="${tag}">
            ${tag}
        </div>
    `).join('');
    
    searchElements.tagSuggestions.style.display = 'block';
    
    // Add click event to suggestions
    searchElements.tagSuggestions.querySelectorAll('.tag-suggestion').forEach(suggestion => {
        suggestion.addEventListener('click', () => {
            addTag(suggestion.dataset.tag);
            searchElements.tagInput.value = '';
            hideTagSuggestions();
            performAdvancedSearch();
        });
    });
}

// Hide tag suggestions
function hideTagSuggestions() {
    if (searchElements.tagSuggestions) {
        searchElements.tagSuggestions.style.display = 'none';
    }
}

// Add a tag
function addTag(tag) {
    const normalizedTag = tag.toLowerCase().trim();
    
    if (normalizedTag && !searchState.selectedTags.has(normalizedTag)) {
        searchState.selectedTags.add(normalizedTag);
        updateSelectedTagsDisplay();
    }
}

// Remove a tag
function removeTag(tag) {
    searchState.selectedTags.delete(tag);
    updateSelectedTagsDisplay();
    performAdvancedSearch();
}

// Update selected tags display
function updateSelectedTagsDisplay() {
    if (!searchElements.selectedTagsContainer) return;
    
    searchElements.selectedTagsContainer.innerHTML = '';
    
    Array.from(searchState.selectedTags).forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag-item';
        tagElement.innerHTML = `
            ${tag}
            <button class="remove-tag" data-tag="${tag}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        tagElement.querySelector('.remove-tag').addEventListener('click', (e) => {
            e.stopPropagation();
            removeTag(tag);
        });
        
        searchElements.selectedTagsContainer.appendChild(tagElement);
    });
}

// Clear all filters
function clearAllFilters() {
    searchState.selectedCategory = '';
    searchState.priceRange = '';
    searchState.selectedTags.clear();
    searchState.searchQuery = '';
    
    // Reset UI elements
    if (searchElements.advancedSearchInput) {
        searchElements.advancedSearchInput.value = '';
    }
    if (searchElements.categoryFilter) {
        searchElements.categoryFilter.value = '';
    }
    if (searchElements.priceFilter) {
        searchElements.priceFilter.value = '';
    }
    if (searchElements.tagInput) {
        searchElements.tagInput.value = '';
    }
    
    updateSelectedTagsDisplay();
    hideTagSuggestions();
    
    // Reset search
    if (appState.products) {
        appState.filteredProducts = appState.products.filter(product => product.status === 'active');
    }
    appState.currentPage = 1;
    renderProducts();
    updateSearchResultsInfo(appState.filteredProducts ? appState.filteredProducts.length : 0);
}

// Update search results information
function updateSearchResultsInfo(count) {
    const resultsInfo = document.getElementById('search-results-info');
    if (!resultsInfo) return;
    
    const totalProducts = appState.products ? 
        appState.products.filter(p => p.status === 'active').length : 0;
    resultsInfo.textContent = `Showing ${count} of ${totalProducts} products`;
    
    if (searchState.searchQuery || searchState.selectedCategory || 
        searchState.priceRange || searchState.selectedTags.size > 0) {
        resultsInfo.style.display = 'inline';
    } else {
        resultsInfo.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initAdvancedSearch);