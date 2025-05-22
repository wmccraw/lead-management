document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const contents = document.querySelectorAll('.content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');

            contents.forEach(content => content.classList.add('hidden'));
            document.getElementById(tab.dataset.tab).classList.remove('hidden');
        });
    });

    // Activate the first tab by default
    tabs[0].click();
});

document.querySelectorAll('.modal .close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        closeBtn.closest('.modal').classList.add('hidden');
    });
});