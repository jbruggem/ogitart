(function(){

    var URL_DATA = '/data';
    var URL_STATUS = '/status';
    var URL_COMPLETION = '/completion';
    var TIMEOUT = 5000;

    var tablePersonLine = _.template('<tr> <td><%= person %></td> <td ><%= sandwich %></td>     </tr>');
    var tableCountLine = _.template('<tr> <td><%= sandwich %></td> <td ><%= count %></td>     </tr>');

    function disableForms(){ 
        $('input:not([disabled="disabled"]), button:not([disabled="disabled"])').attr('disabled', 'disabled'); 
        $('#close-for-today').text("Closed");
    }
    function enableForms(){ 
        $('input[disabled="disabled"], button[disabled="disabled"]').attr('disabled', false);
        $('#close-for-today').text("Close for today");
    }

    function updateUi(){
        $.getJSON(URL_DATA, function( data ){
            var wichs = _.zipObject(data.choices);

            if(data.closed){
                disableForms();
            }else{
                enableForms();
            }

            if( !_(wichs).keys().isEmpty() )
                $('table').removeClass('empty');

            $('#tablePeople tr').remove();

            _(wichs).keys().forEach(function(name){
                $('#tablePeople').append(tablePersonLine({
                    person: name,
                    sandwich: wichs[name],
                }));
            }).value();

            $('#tableDishes tr').remove();

            _(wichs).values().countBy(ogitartUtils.comparer).pairs().forEach(function(count){
                $('#tableDishes').append(tableCountLine({
                    count: count[1],
                    sandwich: _(wichs).values().filter(function(v){ return count[0] === ogitartUtils.comparer(v); }).uniq().join(', '),
                }));
            }).value();

            $('#countDishes').text(_(wichs).size());

        });
    }

    function activateSubmit(){
        $('#addSandwichForm').on('submit', function(e){
            e.preventDefault();
            console.log('submit');
            var name = $('#inputName').val();
            var swich = $('#inputSandwich').val();
            console.log(name + " - " + swich);
            $.ajax({
                type: "POST",
                url: URL_DATA,
                contentType : 'application/json',
                dataType: 'json',
                data: JSON.stringify({ 'choices': [[name, swich]] }),
                success: function( data ){
                    console.log(data);
                    updateUi();
                },
            });
        });
    }

    function cleanName(name){
        return ogitartUtils.comparer(name); //.toLowerCase().replace(/[^a-z]/g, '');
    }

    function activateAutocomplete(){ 
        $.getJSON(URL_COMPLETION, function(data){

            function query(list){ return function(q, cb){
                var cleanQ = cleanName(q);
                cb(_(list)
                    .filter(function(elem){
                        return _.contains(cleanName(elem), cleanQ); })
                    .map(function(e){ return {value: e}; })
                    .valueOf());
            }}

            $('#inputName').typeahead(
                { minLength: 1, highlight: true },
                { source: query(data.names) }
            );
            $('#inputSandwich').typeahead(
                { minLength: 1, highlight: true },
                { source: query(data.dishes) }
            );

        });
    }

    function activateCloseForToday(){
        $('#close-for-today').click(function(){
            var result = window.confirm("Are you sure? This cannot be undone.");
            if(result){
                $.ajax({
                    type: "POST",
                    url: URL_STATUS,
                    contentType : 'application/json',
                    dataType: 'json',
                    data: JSON.stringify({ closed: true }),
                    success: function( data ){
                        console.log(data);
                        updateUi();
                    },
                });
            }
        });
    }

    function activatePrint(){
        var state = true;
        var text = $('.print-button').first().text();
        $('.print-button').click(function(){
            if(state){
                $(this).parents('.table-to-print').addClass('show');
                $('.container').addClass('for-print');
                $('.print-button').text('exit print mode');
            }else{
                $(this).parents('.table-to-print').removeClass('show');
                $('.container').removeClass('for-print');
                $('.print-button').text(text);
            }
            state = !state;
        });
    }

    $(document).ready(function(){

        updateUi();
        setInterval(updateUi, TIMEOUT);

        activateAutocomplete();

        activateSubmit();

        activateCloseForToday();

        activatePrint();
    });
})();
