$(function() {
    if ($('#tag-list').length) {
        var hash = window.location.hash.substr(1);
        if (hash != '') {
            $('#tag-list > li[id!=' + hash + ']').remove();
            $(window).scrollTop(0);
        }
    }
});
