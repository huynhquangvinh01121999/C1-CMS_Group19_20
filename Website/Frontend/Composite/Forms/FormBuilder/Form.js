
$.validator.setDefaults({
    highlight: function (element) {
        $(element).closest('.form-group').addClass('has-error');
    },
    unhighlight: function (element) {
        $(element).closest('.form-group').removeClass('has-error');
    },
    errorElement: 'span',
    errorClass: 'text-danger',
    errorPlacement: function (error, element) {
        if (element.parent('.checkbox-inline, .radio-inline, .fileinput-button').length) {
            error.insertAfter(element.parent().parent());
        } else
            if (element.parent().parent('.checkbox, .radio').length) {
                error.insertAfter(element.parent().parent().parent());
            } else
                if (element.parent('.btn, .input-group').length) {
                    error.insertAfter(element.parent());
                } else {
                    error.insertAfter(element);
                }
    }
});


$.validator.addMethod('maxuploadsizevalidator', function (value, element, params) {
    var maxsize = params[0];
    var totalSize = 0;
    if (element.files) {
        for (i = 0; i < element.files.length; i++) {
            totalSize += element.files[i].size;
        }
    }
    return totalSize <= maxsize;
});

$.validator.addMethod('maxfilecountvalidator', function (value, element, maxfilecount) {
    var totalcount = 0;
    $(element).parents(".fileupload").find('input[type=file]').each(function () {
        if (this.files) {
            totalcount += this.files.length;
        }
        else if (this.value) {
            totalcount += 1;
        }
    });
    return totalcount <= maxfilecount;
});


$(function () {
    $('form.formbuilder').each(function () {
        $(this).validate();
    });


    $("form.formbuilder").on("submit", function (event) {

        if (!$("form.formbuilder").valid()) {
            event.preventDefault();
        }
        var totalUploadSize = 0;
        $(this).find('input[type=file]').each(function () {
            if (this.files) {
                for (i = 0; i < this.files.length; i++) {
                    totalUploadSize += this.files[i].size;
                }
            }
        });
        var maxUploadSize = $(this).attr('maxuploadsize');
        if (totalUploadSize > maxUploadSize) {
            alert($(this).attr('maxuploadsizemessage'));
            event.preventDefault();
        }
        return;
    });

    $('form.formbuilder input[maxuploadsize]').each(function () {
        var maxsize = $(this).attr('maxuploadsize');
        var maxsizemessage = $(this).attr('maxuploadsizemessage');

        $(this).rules('add', {
            maxuploadsizevalidator: [maxsize, maxsizemessage]
        });
    });

    $('form.formbuilder .fileupload[maxfilecount]').each(function () {
        var maxfilecount = $(this).attr('maxfilecount');
        var el = $(this).find("input[type=file]:first");
        el.rules('add', {
            maxfilecountvalidator: maxfilecount
        });
    });



    $('form.formbuilder .fileupload-required').each(function () {
        $(this).rules('add', {
            required: function (element) {
                var totalcount = 0;
                $(element).parents(".fileupload").find('input[type=file]').each(function () {
                    if (this.files) {
                        totalcount += this.files.length;
                    } else if (this.value) { // for IE9
                        totalcount += 1;
                    }
                });
                return totalcount == 0;
            }
        });
    });
});

function fileUpload_PreviewFileTemplate(o) {
    var rows = $();
    $.each(o.files, function (index, file) {
        var row = $('<tr class="template-upload fade">' +
            '<td><span class="preview"></span></td>' +
            '<td><p class="name"></p>' +
            '<p class="text-danger error"></p>' +
            '</td>' +
            '<td><p class="size"></p>' +
            '</td>' +
            '</tr>');
        row.find('.name').text(file.name);
        row.find('.size').text(o.formatFileSize(file.size));
        rows = rows.add(row);
    });
    return rows;
}

function fileUpload_DeletePreviewFileRows(clientid, leaveRowsCount) {
    leaveRowsCount = typeof leaveRowsCount !== 'undefined' ? leaveRowsCount : 1;
    var table = document.getElementById(clientid);
    while (table.rows.length > leaveRowsCount) {
        table.deleteRow(0);
    };
}

function fileUpload_resetFormElement(e) {
    e.wrap('<form>').closest('form').get(0).reset();
    e.unwrap();
}

function fileUpload_resetFormSimpleFileElement(e) {
    if (e[0].files && e[0].files.length == 1) {
        fileUpload_resetFormElement(e);
    }
}

function fileUpload_cancelSelection(clientID) {
    $('#files_' + clientID).html('');
    $('#cancel_' + clientID).hide();
    $('#inputFileds_' + clientID).html('');
}