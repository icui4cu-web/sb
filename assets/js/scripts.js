(() => {
	Fancybox.defaults.autoFocus = false;
	Fancybox.defaults.l10n = {
		CLOSE: "Закрыть",
		NEXT: "Дальше",
		PREV: "Назад",
		MODAL: "Вы можете закрыть данное окно, нажав клавишу ESC",
		ERROR: "Что-то пошло не так. Пожалуйста, повторите попытку позже",
		IMAGE_ERROR: "Изображение не найдено",
		ELEMENT_NOT_FOUND: "HTML элемент не найден",
		AJAX_NOT_FOUND: "Ошибка загрузки AJAX : Не найдено",
		AJAX_FORBIDDEN: "Ошибка загрузки AJAX : Запрещено",
		IFRAME_ERROR: "Ошибка загрузки страницы",
		TOGGLE_ZOOM: "Переключить уровень масштаба",
		TOGGLE_THUMBS: "Переключить эскиз",
		TOGGLE_SLIDESHOW: "Переключить презентацию",
		TOGGLE_FULLSCREEN: "Переключить режим полного экрана",
		DOWNLOAD: "Скачать",
	}
	
	function on(selector, eventType, childSelector, eventHandler) {
		document.querySelectorAll(selector).forEach(el => {
			el.addEventListener(eventType, event => {
				if(childSelector) {
					for (let target = event.target; target && target != el; target = target.parentNode) {
						if (target.matches(childSelector)) {
							eventHandler.call(target, event);
							break;
						}
					}
				} else {
					eventHandler.call(el, event);
				}
			})
		})
	}
	
	function throttle(fn, wait) {
		var scrollTimeout;
		return function () {
			if (!scrollTimeout) {
				scrollTimeout = setTimeout(function () {
					scrollTimeout = null;
					fn();
				}, wait);
			}
		};
	}
	
	// drawer
	class Drawer {
		constructor(drawer) {
			this.drawer = drawer
			this.scrim = this.drawer.nextElementSibling
			this.closeBtn = this.drawer.querySelector('.drawer__close')
			
			this.attachListeners()
		}
		
		static list = {}
		static current = null
		
		open() {
			if(Drawer.current) Drawer.current.close()
			Drawer.current = this
			this.drawer.classList.add('_open', '_animating')
			document.body.classList.add('drawer-scroll-lock')
		}
		
		close() {
			Drawer.current = null
			this.drawer.classList.add('_animating')
			this.drawer.classList.remove('_open')
			document.body.classList.remove('drawer-scroll-lock')
		}
		
		onTransitionEnd() {
			this.drawer.classList.remove('_animating')
		}
		
		attachListeners() {
			this.drawer.addEventListener('transitionend', () => this.onTransitionEnd())
			this.scrim.addEventListener('click', () => this.close())
			this.closeBtn.addEventListener('click', () => this.close())
		}
		
		static init() {
			const triggers = document.querySelectorAll('.js-drawer-trigger')
			
			triggers.forEach(btn => {
				const id = btn.dataset.src || btn.getAttribute('href').split('#')[1]
				const target = document.getElementById(id)
				
				if(!target) return
				if(!Drawer.list.hasOwnProperty(id)) Drawer.list[id] = new this(target)
				btn.addEventListener('click', e => {
					e.preventDefault()
					
					Drawer.list[id].open()
				})
			})
		}
	}
	
	Drawer.init()
	
	class Dropdown {
		constructor(options) {
			this.options = options;
			this.component = document.querySelector(options.component);
			this.dropdown = options.dropdown ? this.component.querySelector(options.dropdown) : this.component;
			this.OPEN_CLASS = options.openClass;
			this.btn;
			
			this.onClickOutside = this.handleClickOutside.bind(this);
		}
		
		isOpen() {
			return this.component.classList.contains(this.OPEN_CLASS);
		}
		
		open() {
			this.component.classList.add(this.OPEN_CLASS);
			this.setMaxHeight();
			document.addEventListener('click', this.onClickOutside, true);
		}
		
		close() {
			this.component.classList.remove(this.OPEN_CLASS);
			document.removeEventListener('click', this.onClickOutside, true);
		}
		
		toggle(btn) {
			this.btn = btn;
			this.isOpen() ? this.close() : this.open();
		}
		
		setMaxHeight() {
			const dropdownTop = this.dropdown.getBoundingClientRect().top;
			const viewportHeight = window.innerHeight;
			const paddingBottom = 20;
			
			this.dropdown.style.maxHeight = (viewportHeight - dropdownTop - paddingBottom) + 'px';
		}
		
		handleClickOutside(e) {
			if(!this.dropdown.contains(e.target) && !this.btn.contains(e.target)) {
				this.close();
			}
		}
	}
	
	const minicart = new Dropdown({
		component: '.minicart',
		openClass: 'minicart_open'
	});
	
	const departments = new Dropdown({
		component: '.departments',
		dropdown: '.departments__dropdown',
		openClass: 'departments_open'
	});
	
	document.getElementById('toggle-cart').addEventListener('click', e => minicart.toggle(e.currentTarget));
	document.querySelector('.departments__btn').addEventListener('click', e => departments.toggle(e.currentTarget));
	
	// Departments
	class Departments {
		constructor(id) {
			this.departments = document.getElementById('shop-hmenu');
			this.currentItem = null;
			
			this.departments.addEventListener('mouseover', this.onMouseover.bind(this));
			this.departments.addEventListener('mouseleave', this.onMouseleave.bind(this));
		}
		
		setCurrentItem(item) {
			this.currentItem = item;
			this.currentItem.classList.add('hmenu-item_hover');
		}
		
		unsetCurrentItem() {
			if(!this.currentItem) return;
			
			this.currentItem.classList.remove('hmenu-item_hover');
			this.currentItem = null;
		}
		
		onMouseover({target}) {
			const item = target.closest('.hmenu-item');
			
			if (item && item !== this.currentItem) {
				this.unsetCurrentItem();
				this.setCurrentItem(item);
			}
		}
		
		onMouseleave() {
			this.unsetCurrentItem();
		}
	}
	
	new Departments();
	
	// swipers
	document.querySelectorAll('.sidebar-slider').forEach(slider => {
		const swiper = slider.querySelector('.sidebar-slider__body');
		const navButtons = slider.querySelectorAll('.sidebar-slider__btn');
		
		new Swiper(swiper, {
			loop: true,
			slidesPerView: 1,
			spaceBetween: 10,
			autoplay: {
				delay: 5000,
				pauseOnMouseEnter: true
			},
			navigation: {
				prevEl: navButtons[0],
				nextEl: navButtons[1]
			},
			breakpoints: {
				480: {
					slidesPerView: 2
				},
				768: {
					slidesPerView: 3
				},
				1200: {
					slidesPerView: 1
				}
			}
		});
	});
	
	new Swiper('.slider', {
		loop: true,
		// autoplay: {
		// 	delay: 5000,
		// 	pauseOnMouseEnter: true
		// },
		pagination: {
			el: '.slider__pagination',
			clickable: true
		}
	});
	
	// categories
	function categoriesToggle({target}) {
		if(!target.closest('.categories__title')) return;
		
		target.closest('.categories__group').classList.toggle('categories__group_expanded');
	}
	
	document.querySelector('.categories')?.addEventListener('click', categoriesToggle)
	
	// to top
	const toTopBtn = document.querySelector('.to-top');
	
	function toggleTopBtn() {
		toTopBtn.classList.toggle('_visible', window.scrollY > 400);
	}
	
	toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
	window.addEventListener('scroll', throttle(toggleTopBtn, 300));
	
	// mobileSearch
	class mobileSearch {
		constructor() {
			this.init = false;
			this.search = null;
			this.closeBtn = null;
		}
		
		show() {
			if(!this.init) {
				this.search = document.querySelector('.mobile-search');
				this.closeBtn = this.search.querySelector('.mobile-search__btn--close');
				this.closeBtn.addEventListener('click', () => this.hide());
				this.init = true;
			}
			
			this.search.classList.add('_visible');
		}
		
		hide() {
			this.search.classList.remove('_visible');
		}
	}
	
	const search = new mobileSearch();
	
	document.querySelector('.indicator--search').addEventListener('click', () => search.show());
	
	let departmentsMenu
	
	const handleMenuMobile = () => {
		if (window.matchMedia('(min-width: 992px)').matches) {
			if (departmentsMenu) {
				departmentsMenu = departmentsMenu.destroy()
			}
		} else {
			if (!departmentsMenu) {
				departmentsMenu = $('#departments-menu').slinky({
					title: true
				})
			}
		}
	}
	
	handleMenuMobile()
	
	window.addEventListener("resize", function() {
		handleMenuMobile()
	});
	
	// tippy
	tippy('[data-tippy-content]', {
		allowHTML: true
	});
	
	// product quantity changer
	function changeProductQuantity() {
		const increment = Number(this.dataset.increment)
		const input = this.closest('.input-number').querySelector('.input-number__qty')
		const quantity = Number(input.value)
		const nextValue = quantity + increment
		
		if(isNaN(nextValue) || nextValue <= 0) return
		input.value = nextValue
		$(input).trigger('input')
	}
	
	on('.input-number', 'click', '.input-number__btn', changeProductQuantity)
	
	// layout-switcher
	function changeProductLayout() {
		document.cookie = `productLayout=${this.dataset.layout}; path=/; max-age=31536000`
		location.reload()
	}
	
	on('.layout-switcher', 'click', '.layout-switcher__btn', changeProductLayout)
	
	function loadModal(src, callback) {
		new Fancybox([
			{
				src: src,
				type: "ajax"
			},
		],
		{
			mainClass: 'modal',
			on: {
				done: (fancybox, slide) => {
					tippy(slide.$el.querySelectorAll('[data-tippy-content]'), {
						allowHTML: true
					})

					if(typeof callback === 'function') callback()
				}
			}
		})
	}

	document.querySelectorAll('.js-ajax-modal').forEach(btn => {
		btn.addEventListener('click', () => loadModal(btn.dataset.modalSrc))
	})
	
	document.querySelectorAll('.js-notify-modal').forEach(btn => {
		btn.addEventListener('click', () => {
			const comment = `Хочет узнать, когда появится ${btn.dataset.title}\nID товара: ${btn.dataset.id}\nСсылка: ${btn.dataset.href}`
			const src = btn.dataset.modalSrc

			loadModal(src, () => {
				document.getElementById('callback-comment').value = comment
			})
		})
	})
})();