/**
 * Manus Gateway Documentation Website
 * JavaScript для интерактивности и функциональности
 * Автор: Дмитрий Жечков
 */

// ==================== Глобальные переменные ====================
const docs = {
    readme: null,
    sdk: null,
    api: null
};

// ==================== Утилиты ====================
const utils = {
    /**
     * Плавная прокрутка к элементу
     */
    smoothScrollTo(element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    },

    /**
     * Debounce функция
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Копирование текста в буфер обмена
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback для старых браузеров
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                textArea.remove();
                return true;
            } catch (err) {
                textArea.remove();
                return false;
            }
        }
    },

    /**
     * Форматирование даты
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('ru-RU', options);
    }
};

// ==================== Навигация ====================
const navigation = {
    init() {
        // Мобильное меню
        const navToggle = document.getElementById('navToggle');
        const navMenu = document.getElementById('navMenu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navToggle.classList.toggle('active');
                navMenu.classList.toggle('active');
            });

            // Закрытие меню при клике на ссылку
            const navLinks = navMenu.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', () => {
                    navToggle.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });
        }

        // Активная ссылка при скролле
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        const observerOptions = {
            root: null,
            rootMargin: '-80px',
            threshold: 0.3
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${id}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }, observerOptions);

        sections.forEach(section => observer.observe(section));

        // Плавная прокрутка при клике на ссылки
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    utils.smoothScrollTo(target);
                }
            });
        });
    }
};

// ==================== Кнопка "Наверх" ====================
const backToTop = {
    init() {
        const button = document.getElementById('backToTop');
        if (!button) return;

        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        });

        button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
};

// ==================== Копирование кода ====================
const copyCode = {
    init() {
        // Инициализация clipboard.js если доступен
        if (typeof ClipboardJS !== 'undefined') {
            const clipboard = new ClipboardJS('.copy-btn', {
                text: function(trigger) {
                    const targetId = trigger.getAttribute('data-clipboard-target');
                    if (targetId) {
                        const target = document.querySelector(targetId);
                        return target ? target.textContent : '';
                    }
                    // Если нет target, берем следующий code block
                    const codeBlock = trigger.closest('.code-block');
                    if (codeBlock) {
                        const code = codeBlock.querySelector('code');
                        return code ? code.textContent : '';
                    }
                    return '';
                }
            });

            clipboard.on('success', function(e) {
                const btn = e.trigger;
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                btn.classList.add('copied');

                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('copied');
                }, 2000);

                e.clearSelection();
            });

            clipboard.on('error', function(e) {
                console.error('Failed to copy:', e);
            });
        } else {
            // Fallback для браузеров без clipboard.js
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', async function() {
                    const codeBlock = this.closest('.code-block');
                    if (codeBlock) {
                        const code = codeBlock.querySelector('code');
                        if (code) {
                            const success = await utils.copyToClipboard(code.textContent);
                            if (success) {
                                const originalHTML = this.innerHTML;
                                this.innerHTML = '<i class="fas fa-check"></i>';
                                this.classList.add('copied');

                                setTimeout(() => {
                                    this.innerHTML = originalHTML;
                                    this.classList.remove('copied');
                                }, 2000);
                            }
                        }
                    }
                });
            });
        }
    }
};

// ==================== Tabs ====================
const tabs = {
    init() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabGroup = button.closest('.tabs');
                const targetTab = button.getAttribute('data-tab');

                // Убираем active у всех кнопок в группе
                tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });

                // Добавляем active текущей кнопке
                button.classList.add('active');

                // Скрываем все tab-content в группе
                tabGroup.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });

                // Показываем нужный tab-content
                const targetContent = tabGroup.querySelector(`#${targetTab}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
            });
        });
    }
};

// ==================== Modal ====================
const modal = {
    currentModal: null,

    open(modalId) {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.classList.add('active');
            this.currentModal = modalElement;
            document.body.style.overflow = 'hidden';
        }
    },

    close() {
        if (this.currentModal) {
            this.currentModal.classList.remove('active');
            this.currentModal = null;
            document.body.style.overflow = '';
        }
    },

    init() {
        // Закрытие по клику на крестик
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => this.close());
        });

        // Закрытие по клику вне модального окна
        document.querySelectorAll('.modal').forEach(modalElement => {
            modalElement.addEventListener('click', (e) => {
                if (e.target === modalElement) {
                    this.close();
                }
            });
        });

        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.close();
            }
        });
    }
};

// ==================== Use Cases ====================
const useCases = {
    cases: {
        simple: {
            title: 'Простая отправка задачи',
            python: `# Создание задачи и сохранение UUID для последующей проверки
task = client.create_task("Summarize the attached document")
save_to_database(task.task_uuid)

# Позже, проверка статуса
task = client.get_task(task_uuid)
if task.status == "completed":
    process_response(task.response)`,
            javascript: `// Создание задачи и сохранение UUID
const task = await client.createTask('Summarize the attached document');
await saveToDatabase(task.task_uuid);

// Позже, проверка статуса
const updatedTask = await client.getTask(taskUuid);
if (updatedTask.status === 'completed') {
  processResponse(updatedTask.response);
}`
        },
        batch: {
            title: 'Пакетная обработка',
            python: `# Создание нескольких задач
prompts = [
    "Analyze dataset A",
    "Analyze dataset B",
    "Analyze dataset C"
]

tasks = [client.create_task(prompt) for prompt in prompts]
task_uuids = [task.task_uuid for task in tasks]

# Ожидание завершения всех
import time
while True:
    results = [client.get_task(uuid) for uuid in task_uuids]
    
    if all(t.status in ["completed", "failed"] for t in results):
        break
    
    time.sleep(30)  # Проверка каждые 30 секунд

# Обработка результатов
for task in results:
    if task.status == "completed":
        print(f"{task.prompt}: {task.response}")`,
            javascript: `// Создание нескольких задач
const prompts = [
  'Analyze dataset A',
  'Analyze dataset B',
  'Analyze dataset C'
];

const tasks = await Promise.all(
  prompts.map(prompt => client.createTask(prompt))
);

// Ожидание завершения всех
const results = await Promise.all(
  tasks.map(task => client.waitForCompletion(task.task_uuid))
);

// Обработка результатов
results.forEach(task => {
  if (task.status === 'completed') {
    console.log(\`\${task.prompt}: \${task.response}\`);
  }
});`
        },
        retry: {
            title: 'Обработка ошибок и повторы',
            python: `from manus_gateway import ManusGatewayError, AuthenticationError
import time

def create_task_with_retry(client, prompt, max_retries=3):
    """Создание задачи с логикой повторных попыток."""
    for attempt in range(max_retries):
        try:
            return client.create_task(prompt)
        except AuthenticationError:
            # Не повторяем при ошибках аутентификации
            raise
        except ManusGatewayError as e:
            if attempt == max_retries - 1:
                raise
            
            wait_time = 2 ** attempt  # Экспоненциальная задержка
            print(f"Попытка {attempt + 1} не удалась, повтор через {wait_time}с...")
            time.sleep(wait_time)

# Использование
try:
    task = create_task_with_retry(client, "Complex analysis task")
except AuthenticationError:
    print("Неверный API ключ")
except ManusGatewayError as e:
    print(f"Ошибка после повторов: {e}")`,
            javascript: `import { 
  ManusGatewayError, 
  AuthenticationError 
} from 'manus-gateway';

async function createTaskWithRetry(client, prompt, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await client.createTask(prompt);
    } catch (error) {
      // Не повторяем при ошибках аутентификации
      if (error instanceof AuthenticationError) {
        throw error;
      }
      
      if (attempt === maxRetries - 1) {
        throw error;
      }
      
      const waitTime = Math.pow(2, attempt) * 1000;
      console.log(\`Попытка \${attempt + 1} не удалась, повтор через \${waitTime}мс...\`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Использование
try {
  const task = await createTaskWithRetry(client, 'Complex analysis task');
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error('Неверный API ключ');
  } else {
    console.error(\`Ошибка после повторов: \${error.message}\`);
  }
}`
        },
        pagination: {
            title: 'Пагинация и фильтрация',
            python: `# Получение всех завершенных задач со всех страниц
all_completed = []
page = 1

while True:
    result = client.list_tasks(status="completed", page=page, limit=50)
    all_completed.extend(result["tasks"])
    
    if page >= result["totalPages"]:
        break
    
    page += 1

print(f"Найдено {len(all_completed)} завершенных задач")

# Обработка каждой завершенной задачи
for task in all_completed:
    analyze_response(task.response)`,
            javascript: `// Получение всех завершенных задач со всех страниц
const allCompleted = [];
let page = 1;

while (true) {
  const result = await client.listTasks({ 
    status: 'completed', 
    page, 
    limit: 50 
  });
  
  allCompleted.push(...result.tasks);
  
  if (page >= result.totalPages) {
    break;
  }
  
  page++;
}

console.log(\`Найдено \${allCompleted.length} завершенных задач\`);

// Обработка каждой завершенной задачи
allCompleted.forEach(task => {
  analyzeResponse(task.response);
});`
        }
    },

    init() {
        // Глобальная функция для открытия use case
        window.showUseCase = (caseId) => {
            const useCase = this.cases[caseId];
            if (!useCase) return;

            const modal = document.getElementById('useCaseModal');
            const title = document.getElementById('useCaseTitle');
            const codeContainer = document.getElementById('useCaseCode');

            if (modal && title && codeContainer) {
                title.textContent = useCase.title;
                
                codeContainer.innerHTML = `
                    <div class="tabs">
                        <div class="tab-buttons">
                            <button class="tab-btn active" data-tab="uc-python-${caseId}">Python</button>
                            <button class="tab-btn" data-tab="uc-js-${caseId}">JavaScript</button>
                        </div>
                        <div class="tab-content active" id="uc-python-${caseId}">
                            <div class="code-block">
                                <div class="code-header">
                                    <span>Python</span>
                                    <button class="copy-btn">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <pre><code class="language-python">${this.escapeHtml(useCase.python)}</code></pre>
                            </div>
                        </div>
                        <div class="tab-content" id="uc-js-${caseId}">
                            <div class="code-block">
                                <div class="code-header">
                                    <span>JavaScript</span>
                                    <button class="copy-btn">
                                        <i class="fas fa-copy"></i>
                                    </button>
                                </div>
                                <pre><code class="language-javascript">${this.escapeHtml(useCase.javascript)}</code></pre>
                            </div>
                        </div>
                    </div>
                `;

                // Подсветка кода
                if (typeof hljs !== 'undefined') {
                    modal.querySelectorAll('pre code').forEach(block => {
                        hljs.highlightElement(block);
                    });
                }

                // Инициализация табов в модальном окне
                tabs.init();
                copyCode.init();

                // Открытие модального окна
                modalModule.open('useCaseModal');
            }
        };
    },

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ==================== Транскрипт ====================
const transcript = {
    async init() {
        await this.loadDocuments();
        this.setupNavigation();
        this.setupControls();
        this.setupSearch();
    },

    async loadDocuments() {
        try {
            // Загрузка документов из папки docs
            const response = await Promise.all([
                fetch('docs/README.md'),
                fetch('docs/SDK_DOCUMENTATION.md'),
                fetch('docs/API_GUIDE.md')
            ]);

            const [readmeText, sdkText, apiText] = await Promise.all(
                response.map(r => r.text())
            );

            docs.readme = readmeText;
            docs.sdk = sdkText;
            docs.api = apiText;

            // Рендеринг документов
            this.renderDocument('readme', docs.readme);
            this.renderDocument('sdk', docs.sdk);
            this.renderDocument('api', docs.api);
        } catch (error) {
            console.error('Ошибка загрузки документов:', error);
            this.showError();
        }
    },

    renderDocument(docType, content) {
        const container = document.getElementById(`${docType}-content`);
        if (!container) return;

        // Конвертация Markdown в HTML
        let html = '';
        if (typeof marked !== 'undefined') {
            html = marked.parse(content);
        } else {
            // Fallback - простое форматирование
            html = content.replace(/\n/g, '<br>');
        }

        container.innerHTML = html;

        // Подсветка кода
        if (typeof hljs !== 'undefined') {
            container.querySelectorAll('pre code').forEach(block => {
                hljs.highlightElement(block);
            });
        }

        // Добавление кнопок копирования к code blocks
        container.querySelectorAll('pre').forEach(pre => {
            const wrapper = document.createElement('div');
            wrapper.className = 'code-block';
            
            const header = document.createElement('div');
            header.className = 'code-header';
            header.innerHTML = `
                <span>Code</span>
                <button class="copy-btn">
                    <i class="fas fa-copy"></i>
                </button>
            `;
            
            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(header);
            wrapper.appendChild(pre);
        });

        // Реинициализация копирования
        copyCode.init();
    },

    setupNavigation() {
        const navLinks = document.querySelectorAll('.trans-nav-link');
        const transcriptDocs = document.querySelectorAll('.transcript-doc');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                const docType = link.getAttribute('data-doc');

                // Убираем active у всех ссылок
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Скрываем все документы
                transcriptDocs.forEach(doc => doc.classList.remove('active'));

                // Показываем выбранный документ
                const targetDoc = document.getElementById(`trans-${docType}`);
                if (targetDoc) {
                    targetDoc.classList.add('active');
                }
            });
        });
    },

    setupControls() {
        // Развернуть всё
        const expandAllBtn = document.getElementById('expandAll');
        if (expandAllBtn) {
            expandAllBtn.addEventListener('click', () => {
                document.querySelectorAll('.doc-content details').forEach(details => {
                    details.open = true;
                });
            });
        }

        // Свернуть всё
        const collapseAllBtn = document.getElementById('collapseAll');
        if (collapseAllBtn) {
            collapseAllBtn.addEventListener('click', () => {
                document.querySelectorAll('.doc-content details').forEach(details => {
                    details.open = false;
                });
            });
        }

        // Скачать транскрипт
        const downloadBtn = document.getElementById('downloadTranscript');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                this.downloadTranscript();
            });
        }
    },

    setupSearch() {
        const searchInput = document.getElementById('transcriptSearch');
        const searchResults = document.getElementById('searchResults');

        if (!searchInput || !searchResults) return;

        const performSearch = utils.debounce((query) => {
            if (!query || query.length < 2) {
                searchResults.innerHTML = '';
                return;
            }

            const results = this.search(query);
            this.displaySearchResults(results, searchResults);
        }, 300);

        searchInput.addEventListener('input', (e) => {
            performSearch(e.target.value);
        });
    },

    search(query) {
        const results = [];
        const searchQuery = query.toLowerCase();

        Object.keys(docs).forEach(docType => {
            const content = docs[docType];
            if (!content) return;

            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.toLowerCase().includes(searchQuery)) {
                    // Контекст вокруг найденного текста
                    const start = Math.max(0, index - 1);
                    const end = Math.min(lines.length, index + 2);
                    const context = lines.slice(start, end).join(' ');

                    results.push({
                        docType,
                        line: index + 1,
                        context: context.substring(0, 150) + '...',
                        match: line.trim()
                    });
                }
            });
        });

        return results.slice(0, 10); // Показываем только первые 10 результатов
    },

    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
            return;
        }

        const docNames = {
            readme: 'README',
            sdk: 'SDK Documentation',
            api: 'API Guide'
        };

        container.innerHTML = results.map(result => `
            <div class="search-result-item" data-doc="${result.docType}">
                <div class="search-result-title">
                    ${docNames[result.docType]} (строка ${result.line})
                </div>
                <div class="search-result-snippet">
                    ${this.highlightMatch(result.context, document.getElementById('transcriptSearch').value)}
                </div>
            </div>
        `).join('');

        // Клик по результату поиска
        container.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const docType = item.getAttribute('data-doc');
                const navLink = document.querySelector(`.trans-nav-link[data-doc="${docType}"]`);
                if (navLink) {
                    navLink.click();
                }
            });
        });
    },

    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    },

    downloadTranscript() {
        const activeDoc = document.querySelector('.transcript-doc.active');
        if (!activeDoc) return;

        const docId = activeDoc.id.replace('trans-', '');
        const content = docs[docId];
        if (!content) return;

        const blob = new Blob([content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${docId.toUpperCase()}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    showError() {
        ['readme', 'sdk', 'api'].forEach(docType => {
            const container = document.getElementById(`${docType}-content`);
            if (container) {
                container.innerHTML = `
                    <div class="error-message" style="text-align: center; padding: 3rem; color: var(--error);">
                        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                        <h3>Ошибка загрузки документации</h3>
                        <p>Не удалось загрузить файлы документации. Пожалуйста, проверьте подключение к интернету.</p>
                    </div>
                `;
            }
        });
    }
};

// Используем modal вместо modalModule
const modalModule = modal;

// ==================== Инициализация ====================
document.addEventListener('DOMContentLoaded', () => {
    // Подсветка кода
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
    }

    // Инициализация модулей
    navigation.init();
    backToTop.init();
    copyCode.init();
    tabs.init();
    modal.init();
    useCases.init();
    transcript.init();

    // Анимация элементов при появлении
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-slide-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.feature-card, .endpoint-card, .use-case-card').forEach(el => {
        observer.observe(el);
    });

    console.log('✅ Manus Gateway Documentation initialized');
});

// Экспорт для использования в других скриптах
window.ManusGatewayDocs = {
    utils,
    navigation,
    modal,
    transcript
};
