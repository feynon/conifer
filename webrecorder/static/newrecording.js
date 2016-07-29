$(function() {
    var DEFAULT_RECORDING_SESSION_NAME = "Recording Session";

    // 'New recording': Start button
    $('header').on('submit', '.start-recording', startNewRecording);

    // 'Homepage': 'Record' button
    $('.wr-content').on('submit', '.start-recording-homepage', startNewRecording);


    function startNewRecording(event) {
        event.preventDefault();

        var collection;

        if (!user) {
            user = "$temp";
            collection = "temp";
        } else {
            collection = $('[data-collection-id]').attr('data-collection-id');
        }

        var title = $("input[name='rec-title']").val();
        var url = $("input[name='url']").val();

        var success = function(data) {
            title = data.recording.title;
            var id = data.recording.id;

            RouteTo.recordingInProgress(user, collection, id, url);
        };

        var fail = function(data) {
            //NOP
        }

        var attrs = {"title": title,
                     "coll_title": "Temporary Collection"}

        setStorage("__wr_currRec", title);

        Recordings.create(user, collection, attrs, success, fail);
    };

    function setStorage(name, value) {
        if (window.sessionStorage) {
            window.sessionStorage.setItem(name, value);
        }

        if (window.localStorage) {
            window.localStorage.setItem(name, value);
        }
    }

    function getStorage(name) {
        var value = undefined;

        // First try session, then local
        if (window.sessionStorage) {
            value = window.sessionStorage.getItem(name);
        }

        if (!value && window.localStorage) {
            value = window.localStorage.getItem(name);
        }

        return value;
    }


    // 'Homepage': Logged in collection dropdown select
    $('.wr-content').on('click', '.collection-select', function(event) {
        event.preventDefault();

        var currColl = $(this).data('collection-id');

        $('.dropdown-toggle-collection').html(
            $('<span class="dropdown-toggle-label" data-collection-id="' +
                currColl + '">' +
                    $(this).text() + " " +
                '<span class="caret"></span>'));

        setStorage("__wr_currColl", currColl);
    });

    $('#create-coll').on('submit', function(event) {
        event.preventDefault();

        var title = $("#create-coll #title").val();
        var is_public = $("#create-coll #is_public").prop("checked");

        var success = function(data) {
            if (!data.collection || !data.collection.id) {
                return;
            }

            setStorage("__wr_currColl", data.collection.id);

            if (window.location.pathname == "/") {
                window.location.reload();
            } else if (curr_user == user) {
                RouteTo.collectionInfo(user, data.collection.id);
            }
        }

        var fail = function(data) {
            window.location.reload();
        }

        Collections.create(title, is_public, success, fail);
    });

    // Set default recording title
    var currRec = getStorage("__wr_currRec");

    if (!currRec) {
        currRec = DEFAULT_RECORDING_SESSION_NAME;
    }

    $("input[name='rec-title']").val(currRec);

    // Only for logged in users below
    if (!user) {
        return;
    }

    // If logged-in user and has collection selector (homepage)
    // select first collection
    var currColl = getStorage("__wr_currColl");

    var collSelect = undefined;

    if (currColl) {
        collSelect = $(".dropdown a[data-collection-id='" + currColl + "']");
    }

    if (!collSelect || !collSelect.length) {
        collSelect = $(".collection-select");
    }

    if (collSelect && collSelect.length > 0) {
        collSelect[0].click();
    }
});

$(function() {
    $("#choose-upload").click(function() {
        $("#choose-upload-file").click();
    });

    $("#choose-upload-file").on('change', function() {
        var filename = $(this).val().replace(/^C:\\fakepath\\/i, "");

        $("#upload-file").val(filename);
    });

    var bar = $('.upload-bar');
    var percent = $('.upload-percent');
    var status = $('#upload-status');
    var uploader = $(".upload-progress");
       
    $('#upload-form').ajaxForm({
        beforeSend: function() {
            status.text("Uploading...");

            var percentVal = '0%';
            bar.width(percentVal)
            percent.html(percentVal);
            uploader.show();
            status.show();
        },
        uploadProgress: function(event, position, total, percentComplete) {
            var percentVal = percentComplete + '%';
            bar.width(percentVal)
            percent.html(percentVal);
        },
        success: function() {
            var percentVal = '100%';
            bar.width(percentVal)
            percent.html(percentVal);
        },
        complete: function(xhr) {
            //uploader.hide();
            status.html(xhr.responseText);
        }
    }); 

    $("#upload-modal").on('show.bs.modal', function() {
        uploader.hide();
        status.hide();
    });

});




