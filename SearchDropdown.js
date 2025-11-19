class SearchDropdown {
    constructor(inputId, dropdownId, targetId, apiUrl, getBody = () => ({}),
        displayFields = ['title'], separator = ' : ', onSelect = null) {

        this.input = document.getElementById(inputId);
        this.dropdown = document.getElementById(dropdownId);
        this.apiUrl = apiUrl;
        this.getBody = getBody;
        this.displayFields = displayFields;
        this.separator = separator;
        this.targetId = targetId;
        this.onSelect = onSelect;

        if (!this.input) return console.error(`Input ${inputId} not found`);
        if (!this.dropdown) return console.error(`Dropdown ${dropdownId} not found`);

        this.input.addEventListener('input', () => this.onInput());
        document.addEventListener('click', e => this.onDocumentClick(e));

    }

    async onInput() {
        if (!this.input || !this.dropdown) return;
        const keyword = this.input.value.trim();
        this.dropdown.innerHTML = "";
        // if (!keyword) return this.dropdown.style.display = "none";

        try {
            const body = this.getBody(keyword);
            const res = await fetch(this.apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();
            const results = data.result || [];

            if (!results.length) return this.dropdown.style.display = "none";

            results.forEach(itemData => {
                const item = document.createElement('button');
                item.type = 'button';
                item.className = 'list-group-item list-group-item-action';
                item.textContent = this.displayFields.map(f => itemData[f] ?? '').join(this.separator);
                item.onclick = () => this.onItemClick(itemData);
                this.dropdown.appendChild(item);
            });

            this.dropdown.style.display = "block";
        } catch (err) {
            console.error('Search error:', err);
        }
    }

    onItemClick(itemData) {
        this.input.value = this.displayFields.map(f => itemData[f] ?? '').join(this.separator);

        if (this.targetId) {
            const hiddenInput = document.getElementById(this.targetId);
            if (hiddenInput) hiddenInput.value = itemData.id;
        }

        this.dropdown.style.display = "none";
        if (this.onSelect && typeof this.onSelect === 'function') {
            this.onSelect(itemData);
        }
    }

    onDocumentClick(e) {
        if (!this.input || !this.dropdown) return;

        if (this.input.contains(e.target)) {
            // ถ้าคลิกใน input → โหลด dropdown
            this.onInput();
        } else if (!this.dropdown.contains(e.target)) {
            // ถ้าคลิกข้างนอก dropdown → ซ่อน dropdown
            this.dropdown.style.display = "none";
        }
    }
}

window.SearchDropdown = SearchDropdown;



/*
วิธีใช้
<div class="col-md-3 position-relative">
    <input type="hidden" name="quizCourseId" id="quizCourseId">
    <label class="form-label required">เลือกหลักสูตร</label>
    <input type="text" class="form-control form-control-sm" id="quiz-course-search" placeholder="พิมพ์เพื่อค้นหาหลักสูตร" autocomplete="off">
    <div id="quiz-course-dropdown" class="list-group position-absolute w-100 small" style="z-index:1000; display:none; max-height:200px; overflow-y:auto;"></div>
</div>
<div class="col-md-3 position-relative">
    <input type="hidden" name="quizVideoId" id="quizVideoId">
    <label class="form-label required">เลือกวิดีโอ</label>
    <input type="text" class="form-control form-control-sm" id="quiz-video-search" placeholder="พิมพ์เพื่อค้นหาวิดีโอ" autocomplete="off">
    <div id="quiz-video-dropdown" class="list-group position-absolute w-100 small" style="z-index:1000; display:none; max-height:200px; overflow-y:auto;"></div>
</div>

<script src="js/SearchDropdown.js"></script>
<script>
    
    new SearchDropdown(
        'quiz-course-search',
        'quiz-course-dropdown',
        'quizCourseId',
        CONFIG.course,
        (keyword) => ({
            search_term: keyword
        }),
        ['id', 'title'],
        ' : '
    );


    new SearchDropdown(
        'quiz-video-search',
        'quiz-video-dropdown',
        'quizVideoId',
        CONFIG.video,
        (keyword) => ({
            search_term: keyword,
            course_id: document.getElementById('quizCourseId').value || 'all',
        }),
        ['id', 'title'],
        ' : '
    );

    new SearchDropdown(
        'quiz-video-search',
        'quiz-video-dropdown',
        'quizVideoId',
        CONFIG.video,
        (keyword) => ({
            search_term: keyword,
            course_id: document.getElementById('quizCourseId').value || 'all',
        }),
        ['id', 'title'],
        ' : ',
        (selectedData) => {
            // ⬅ selectedData = itemData ที่เลือก เช่น { id, title, ... }
            const videoId = selectedData.id;
            const courseId = document.getElementById('quizCourseId').value || 'all';

            loadQuizzes(courseId, videoId);
        }
    );

</script>

*/
