function selectTag(tag) {
    window.location.hash = '#!' + tag.html();
    $('#tags header li').removeClass('selected');
    tag.parent().addClass('selected');
    $('#tag-list > li').hide().filter('#' + tag.html()).slideDown();
}

$(function() {
    if ($('#tags').length) {
        var hash = window.location.hash.substr(1);
        hash = hash.indexOf('!') == 0 ? hash.substr(1) : hash;
        if (hash != '') {
            if ($('#tag-' + hash).length) {
                $(window).scrollTop(0);
                selectTag($('#tag-' + hash + ' a'));
            }
        }

        $('#tags header a').click(function() {
            selectTag($(this));
            return false;
        });
    }
});
