/**
 * Hijri Date Widget - Embeddable Islamic Calendar Widget
 * 
 * Usage:
 * <div data-hijri-widget 
 *      data-lang="ar" 
 *      data-country="SA" 
 *      data-method="ummalqura"
 *      data-theme="light">
 * </div>
 * <script src="https://your-domain.com/hijri-widget.js"></script>
 */

(function() {
    'use strict';

    // Widget translations
    const WIDGET_TRANSLATIONS = {
        en: {
            method: 'Method',
            country: 'Country',
            error_loading: 'Error loading Hijri date',
            loading: 'Loading...',
            copy: 'Copy',
            copied: 'Copied!'
        },
        ar: {
            method: 'الطريقة',
            country: 'البلد',
            error_loading: 'خطأ في تحميل التاريخ الهجري',
            loading: 'جاري التحميل...',
            copy: 'نسخ',
            copied: 'تم النسخ!'
        }
    };

    // Widget configuration
    const WIDGET_CONFIG = {
        apiBaseUrl: window.location.origin,
        defaultLang: 'en',
        defaultCountry: null, // Auto-detect
        defaultMethod: null, // Use country default
        defaultTheme: 'light',
        copyTimeout: 2000,
        retryAttempts: 3,
        retryDelay: 1000,
        useExternalCSS: true, // Load external CSS file
        cssUrl: null // Auto-detect from script location
    };

    // Widget state management
    const widgetState = {
        instances: new Map(),
        loadingCount: 0,
        errorCount: 0
    };

    // Utility functions
    const utils = {
        /**
         * Generate unique widget ID
         */
        generateId: function() {
            return 'hijri-widget-' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Get data attribute value with fallback
         */
        getDataAttr: function(element, attr, fallback) {
            const value = element.getAttribute('data-' + attr);
            return value !== null ? value : fallback;
        },

        /**
         * Validate language code
         */
        isValidLang: function(lang) {
            return ['ar', 'en'].includes(lang);
        },

        /**
         * Validate country code
         */
        isValidCountry: function(country) {
            return /^[A-Z]{2}$/.test(country);
        },

        /**
         * Validate theme
         */
        isValidTheme: function(theme) {
            return ['light', 'dark', 'auto', 'compact', 'minimal'].includes(theme);
        },

        /**
         * Get translated text
         */
        translate: function(key, lang) {
            const translations = WIDGET_TRANSLATIONS[lang] || WIDGET_TRANSLATIONS.en;
            return translations[key] || key;
        },

        /**
         * Format date for display
         */
        formatDate: function(date, lang) {
            if (lang === 'ar') {
                return this.toArabicNumerals(`${date.day} ${this.getMonthName(date.month, 'ar')} ${date.year}`);
            } else {
                return `${date.day} ${this.getMonthName(date.month, 'en')} ${date.year}`;
            }
        },

        /**
         * Convert to Arabic-Indic numerals
         */
        toArabicNumerals: function(str) {
            const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
            return str.replace(/[0-9]/g, function(match) {
                return arabicNumerals[parseInt(match)];
            });
        },

        /**
         * Get month name
         */
        getMonthName: function(month, lang) {
            const months = {
                ar: [
                    'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الثانية',
                    'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
                ],
                en: [
                    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani', 'Jumada al-awwal', 'Jumada al-thani',
                    'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
                ]
            };
            return months[lang][month - 1] || month.toString();
        },

        /**
         * Copy text to clipboard
         */
        copyToClipboard: function(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                return new Promise(function(resolve, reject) {
                    try {
                        const successful = document.execCommand('copy');
                        document.body.removeChild(textArea);
                        if (successful) {
                            resolve();
                        } else {
                            reject(new Error('Copy command failed'));
                        }
                    } catch (err) {
                        document.body.removeChild(textArea);
                        reject(err);
                    }
                });
            }
        },

        /**
         * Debounce function
         */
        debounce: function(func, wait) {
            let timeout;
            return function executedFunction() {
                const later = function() {
                    clearTimeout(timeout);
                    func.apply(this, arguments);
                }.bind(this);
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // API functions
    const api = {
        /**
         * Fetch today's Hijri date
         */
        fetchTodayDate: function(country) {
            const url = new URL(WIDGET_CONFIG.apiBaseUrl + '/api/today');
            if (country) {
                url.searchParams.set('country', country);
            }

            return fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('API request failed: ' + response.status);
                }
                return response.json();
            })
            .then(function(data) {
                if (data.error) {
                    throw new Error(data.error.message || 'API error');
                }
                return data;
            });
        },

        /**
         * Retry API call with exponential backoff
         */
        retryApiCall: function(apiCall, attempts) {
            attempts = attempts || WIDGET_CONFIG.retryAttempts;
            
            return apiCall().catch(function(error) {
                if (attempts > 1) {
                    return new Promise(function(resolve) {
                        setTimeout(function() {
                            resolve(api.retryApiCall(apiCall, attempts - 1));
                        }, WIDGET_CONFIG.retryDelay);
                    });
                } else {
                    throw error;
                }
            });
        }
    };

    // Widget class
    function HijriWidget(element, config) {
        this.element = element;
        this.id = utils.generateId();
        this.config = {
            lang: config.lang || WIDGET_CONFIG.defaultLang,
            country: config.country || WIDGET_CONFIG.defaultCountry,
            method: config.method || WIDGET_CONFIG.defaultMethod,
            theme: config.theme || WIDGET_CONFIG.defaultTheme
        };
        this.data = null;
        this.isLoading = false;
        this.hasError = false;

        // Validate configuration
        if (!utils.isValidLang(this.config.lang)) {
            this.config.lang = WIDGET_CONFIG.defaultLang;
        }

        if (this.config.country && !utils.isValidCountry(this.config.country)) {
            this.config.country = null;
        }

        if (!utils.isValidTheme(this.config.theme)) {
            this.config.theme = WIDGET_CONFIG.defaultTheme;
        }

        // Initialize widget
        this.init();
    }

    HijriWidget.prototype = {
        /**
         * Initialize widget
         */
        init: function() {
            this.element.id = this.id;
            this.updateClasses();
            
            this.render();
            this.loadData();
            this.bindEvents();
        },

        /**
         * Update widget CSS classes
         */
        updateClasses: function() {
            const classes = ['hijri-widget'];
            
            // Add theme class
            if (this.config.theme !== 'light') {
                classes.push('hijri-widget-' + this.config.theme);
            }
            
            // Add RTL class for Arabic
            if (this.config.lang === 'ar') {
                classes.push('hijri-widget-rtl');
            }
            
            this.element.className = classes.join(' ');
        },

        /**
         * Load Hijri date data
         */
        loadData: function() {
            if (this.isLoading) return;

            this.isLoading = true;
            this.hasError = false;
            widgetState.loadingCount++;
            
            this.renderLoading();

            const self = this;
            api.retryApiCall(function() {
                return api.fetchTodayDate(self.config.country);
            })
            .then(function(data) {
                self.data = data;
                self.isLoading = false;
                widgetState.loadingCount--;
                self.renderSuccess();
            })
            .catch(function(error) {
                console.error('Hijri Widget Error:', error);
                self.isLoading = false;
                self.hasError = true;
                widgetState.loadingCount--;
                widgetState.errorCount++;
                self.renderError(error.message);
            });
        },

        /**
         * Render widget HTML structure
         */
        render: function() {
            const isRtl = this.config.lang === 'ar';
            const dir = isRtl ? 'rtl' : 'ltr';
            
            const loadingText = utils.translate('loading', this.config.lang);
            const copyText = utils.translate('copy', this.config.lang);
            const copyTitle = `${copyText} ${utils.translate('method', this.config.lang)}`;
            
            this.element.innerHTML = `
                <div class="hijri-widget-container" dir="${dir}">
                    <div class="hijri-widget-content">
                        <div class="hijri-widget-loading" style="display: none;">
                            <div class="hijri-widget-spinner"></div>
                            <span class="hijri-widget-loading-text">${loadingText}</span>
                        </div>
                        <div class="hijri-widget-error" style="display: none;">
                            <span class="hijri-widget-error-icon">⚠️</span>
                            <span class="hijri-widget-error-text"></span>
                        </div>
                        <div class="hijri-widget-success" style="display: none;">
                            <div class="hijri-widget-date">
                                <div class="hijri-widget-hijri-date"></div>
                                <div class="hijri-widget-gregorian-date"></div>
                            </div>
                            <div class="hijri-widget-actions">
                                <button class="hijri-widget-copy-btn" type="button" title="${copyTitle}">
                                    <span class="hijri-widget-copy-icon">📋</span>
                                    <span class="hijri-widget-copy-text">${copyText}</span>
                                </button>
                            </div>
                            <div class="hijri-widget-method">
                                <span class="hijri-widget-method-text"></span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        },

        /**
         * Render loading state
         */
        renderLoading: function() {
            const loading = this.element.querySelector('.hijri-widget-loading');
            const success = this.element.querySelector('.hijri-widget-success');
            const error = this.element.querySelector('.hijri-widget-error');
            
            if (loading) loading.style.display = 'block';
            if (success) success.style.display = 'none';
            if (error) error.style.display = 'none';
        },

        /**
         * Render success state with data
         */
        renderSuccess: function() {
            if (!this.data) return;

            const loading = this.element.querySelector('.hijri-widget-loading');
            const success = this.element.querySelector('.hijri-widget-success');
            const error = this.element.querySelector('.hijri-widget-error');
            
            if (loading) loading.style.display = 'none';
            if (error) error.style.display = 'none';
            if (success) success.style.display = 'block';

            // Update date display
            const hijriDateEl = this.element.querySelector('.hijri-widget-hijri-date');
            const gregorianDateEl = this.element.querySelector('.hijri-widget-gregorian-date');
            const methodEl = this.element.querySelector('.hijri-widget-method-text');

            if (hijriDateEl) {
                hijriDateEl.textContent = utils.formatDate(this.data.hijri, this.config.lang);
            }

            if (gregorianDateEl) {
                const gregorianFormatted = utils.formatDate(this.data.gregorian, this.config.lang);
                gregorianDateEl.textContent = gregorianFormatted;
            }

            if (methodEl) {
                const methodLabel = utils.translate('method', this.config.lang);
                methodEl.textContent = `${methodLabel}: ${this.data.method}`;
            }
        },

        /**
         * Render error state
         */
        renderError: function(message) {
            const loading = this.element.querySelector('.hijri-widget-loading');
            const success = this.element.querySelector('.hijri-widget-success');
            const error = this.element.querySelector('.hijri-widget-error');
            const errorText = this.element.querySelector('.hijri-widget-error-text');
            
            if (loading) loading.style.display = 'none';
            if (success) success.style.display = 'none';
            if (error) error.style.display = 'block';
            
            if (errorText) {
                const errorMessage = utils.translate('error_loading', this.config.lang);
                errorText.textContent = errorMessage;
            }
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            const self = this;
            const copyBtn = this.element.querySelector('.hijri-widget-copy-btn');
            
            if (copyBtn) {
                copyBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    self.handleCopy();
                });
            }
        },

        /**
         * Handle copy functionality
         */
        handleCopy: function() {
            if (!this.data) return;

            const hijriText = utils.formatDate(this.data.hijri, this.config.lang);
            const gregorianText = utils.formatDate(this.data.gregorian, this.config.lang);
            const copyText = `${hijriText} (${gregorianText})`;

            const copyBtn = this.element.querySelector('.hijri-widget-copy-btn');
            const copyTextEl = this.element.querySelector('.hijri-widget-copy-text');
            
            utils.copyToClipboard(copyText)
                .then(function() {
                    if (copyTextEl) {
                        const originalText = copyTextEl.textContent;
                        const successText = utils.translate('copied', this.config.lang);
                        
                        copyTextEl.textContent = successText;
                        if (copyBtn) copyBtn.classList.add('hijri-widget-copied');
                        
                        setTimeout(function() {
                            if (copyTextEl) copyTextEl.textContent = originalText;
                            if (copyBtn) copyBtn.classList.remove('hijri-widget-copied');
                        }, WIDGET_CONFIG.copyTimeout);
                    }
                }.bind(this))
                .catch(function(error) {
                    console.error('Copy failed:', error);
                    // Could show a fallback message or modal with the text to copy manually
                });
        },

        /**
         * Refresh widget data
         */
        refresh: function() {
            this.loadData();
        },

        /**
         * Update widget configuration
         */
        updateConfig: function(newConfig) {
            let needsRefresh = false;
            
            if (newConfig.country !== this.config.country) {
                this.config.country = newConfig.country;
                needsRefresh = true;
            }
            
            if (newConfig.method !== this.config.method) {
                this.config.method = newConfig.method;
                needsRefresh = true;
            }
            
            if (newConfig.lang !== this.config.lang) {
                this.config.lang = newConfig.lang;
                this.updateClasses();
                this.render();
                needsRefresh = true;
            }
            
            if (newConfig.theme !== this.config.theme) {
                this.config.theme = newConfig.theme;
                this.updateClasses();
            }
            
            if (needsRefresh) {
                this.loadData();
            }
        },

        /**
         * Destroy widget instance
         */
        destroy: function() {
            widgetState.instances.delete(this.id);
            this.element.innerHTML = '';
            this.element.removeAttribute('id');
            this.element.className = '';
        }
    };

    // Widget initialization and management
    const WidgetManager = {
        /**
         * Initialize all widgets on the page
         */
        init: function() {
            this.injectStyles();
            this.initializeWidgets();
            this.setupGlobalHandlers();
        },

        /**
         * Inject widget styles
         */
        injectStyles: function() {
            // Check if external CSS should be loaded
            if (WIDGET_CONFIG.useExternalCSS) {
                this.loadExternalCSS();
            } else {
                this.injectInlineStyles();
            }
        },

        /**
         * Load external CSS file
         */
        loadExternalCSS: function() {
            if (document.getElementById('hijri-widget-external-styles')) return;

            const cssUrl = WIDGET_CONFIG.cssUrl || this.detectCSSUrl();
            if (!cssUrl) {
                console.warn('Hijri Widget: Could not detect CSS URL, falling back to inline styles');
                this.injectInlineStyles();
                return;
            }

            const link = document.createElement('link');
            link.id = 'hijri-widget-external-styles';
            link.rel = 'stylesheet';
            link.href = cssUrl;
            link.onerror = function() {
                console.warn('Hijri Widget: Failed to load external CSS, falling back to inline styles');
                this.injectInlineStyles();
            }.bind(this);
            
            document.head.appendChild(link);
        },

        /**
         * Detect CSS URL from script location
         */
        detectCSSUrl: function() {
            const scripts = document.getElementsByTagName('script');
            for (let i = 0; i < scripts.length; i++) {
                const script = scripts[i];
                if (script.src && script.src.includes('hijri-widget.js')) {
                    return script.src.replace('hijri-widget.js', 'hijri-widget.css');
                }
            }
            return null;
        },

        /**
         * Inject inline styles as fallback
         */
        injectInlineStyles: function() {
            if (document.getElementById('hijri-widget-inline-styles')) return;

            const styles = document.createElement('style');
            styles.id = 'hijri-widget-inline-styles';
            styles.textContent = this.getWidgetCSS();
            document.head.appendChild(styles);
        },

        /**
         * Get widget CSS
         */
        getWidgetCSS: function() {
            return `
                .hijri-widget {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                    color: #333;
                    background: #fff;
                    border: 1px solid #e1e5e9;
                    border-radius: 8px;
                    padding: 16px;
                    max-width: 300px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .hijri-widget-dark {
                    color: #e1e5e9;
                    background: #2d3748;
                    border-color: #4a5568;
                }
                
                .hijri-widget-rtl {
                    direction: rtl;
                    text-align: right;
                }
                
                .hijri-widget-container {
                    width: 100%;
                }
                
                .hijri-widget-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 20px;
                }
                
                .hijri-widget-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid #e1e5e9;
                    border-top: 2px solid #3182ce;
                    border-radius: 50%;
                    animation: hijri-widget-spin 1s linear infinite;
                }
                
                @keyframes hijri-widget-spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .hijri-widget-error {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px;
                    background: #fed7d7;
                    color: #c53030;
                    border-radius: 4px;
                    font-size: 13px;
                }
                
                .hijri-widget-dark .hijri-widget-error {
                    background: #742a2a;
                    color: #feb2b2;
                }
                
                .hijri-widget-success {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .hijri-widget-date {
                    text-align: center;
                }
                
                .hijri-widget-hijri-date {
                    font-size: 18px;
                    font-weight: 600;
                    color: #2d3748;
                    margin-bottom: 4px;
                }
                
                .hijri-widget-dark .hijri-widget-hijri-date {
                    color: #e2e8f0;
                }
                
                .hijri-widget-gregorian-date {
                    font-size: 14px;
                    color: #718096;
                }
                
                .hijri-widget-dark .hijri-widget-gregorian-date {
                    color: #a0aec0;
                }
                
                .hijri-widget-actions {
                    display: flex;
                    justify-content: center;
                }
                
                .hijri-widget-copy-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: #3182ce;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }
                
                .hijri-widget-copy-btn:hover {
                    background: #2c5aa0;
                }
                
                .hijri-widget-copy-btn.hijri-widget-copied {
                    background: #38a169;
                }
                
                .hijri-widget-method {
                    text-align: center;
                    font-size: 11px;
                    color: #a0aec0;
                    border-top: 1px solid #e2e8f0;
                    padding-top: 8px;
                }
                
                .hijri-widget-dark .hijri-widget-method {
                    color: #718096;
                    border-top-color: #4a5568;
                }
                
                /* Responsive design */
                @media (max-width: 480px) {
                    .hijri-widget {
                        max-width: 100%;
                        font-size: 13px;
                    }
                    
                    .hijri-widget-hijri-date {
                        font-size: 16px;
                    }
                }
            `;
        },

        /**
         * Initialize all widget elements
         */
        initializeWidgets: function() {
            const elements = document.querySelectorAll('[data-hijri-widget]');
            
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                
                // Skip if already initialized
                if (element.id && element.id.startsWith('hijri-widget-')) {
                    continue;
                }
                
                const config = {
                    lang: utils.getDataAttr(element, 'lang', WIDGET_CONFIG.defaultLang),
                    country: utils.getDataAttr(element, 'country', WIDGET_CONFIG.defaultCountry),
                    method: utils.getDataAttr(element, 'method', WIDGET_CONFIG.defaultMethod),
                    theme: utils.getDataAttr(element, 'theme', WIDGET_CONFIG.defaultTheme)
                };
                
                const widget = new HijriWidget(element, config);
                widgetState.instances.set(widget.id, widget);
            }
        },

        /**
         * Setup global event handlers
         */
        setupGlobalHandlers: function() {
            // Handle dynamic content loading
            if (typeof MutationObserver !== 'undefined') {
                const observer = new MutationObserver(utils.debounce(function(mutations) {
                    let shouldReinit = false;
                    
                    for (let i = 0; i < mutations.length; i++) {
                        const mutation = mutations[i];
                        if (mutation.type === 'childList') {
                            for (let j = 0; j < mutation.addedNodes.length; j++) {
                                const node = mutation.addedNodes[j];
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    if (node.hasAttribute && node.hasAttribute('data-hijri-widget')) {
                                        shouldReinit = true;
                                        break;
                                    }
                                    if (node.querySelector && node.querySelector('[data-hijri-widget]')) {
                                        shouldReinit = true;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                    
                    if (shouldReinit) {
                        WidgetManager.initializeWidgets();
                    }
                }, 100));
                
                observer.observe(document.body, {
                    childList: true,
                    subtree: true
                });
            }
        },

        /**
         * Refresh all widgets
         */
        refreshAll: function() {
            widgetState.instances.forEach(function(widget) {
                widget.refresh();
            });
        },

        /**
         * Get widget instance by element or ID
         */
        getInstance: function(elementOrId) {
            if (typeof elementOrId === 'string') {
                return widgetState.instances.get(elementOrId);
            } else if (elementOrId && elementOrId.id) {
                return widgetState.instances.get(elementOrId.id);
            }
            return null;
        },

        /**
         * Get widget statistics
         */
        getStats: function() {
            return {
                totalWidgets: widgetState.instances.size,
                loadingWidgets: widgetState.loadingCount,
                errorCount: widgetState.errorCount
            };
        }
    };

    // Global API
    window.HijriWidget = {
        init: WidgetManager.init.bind(WidgetManager),
        refresh: WidgetManager.refreshAll.bind(WidgetManager),
        getInstance: WidgetManager.getInstance.bind(WidgetManager),
        getStats: WidgetManager.getStats.bind(WidgetManager)
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', WidgetManager.init.bind(WidgetManager));
    } else {
        WidgetManager.init();
    }

})();