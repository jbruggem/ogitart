(function(){

    var URL_DATA = '/data';
    var URL_COMPLETION = '/completion';
    var TIMEOUT = 5000;

    var tablePersonLine = _.template('<tr> <td><%= person %></td> <td ><%= sandwich %></td>     </tr>');
    var tableCountLine = _.template('<tr> <td><%= sandwich %></td> <td ><%= count %></td>     </tr>');

    function updateTable(){
        $.getJSON(URL_DATA, function( data ){
            var wichs = _.zipObject(data.choices);

            $('#tableSandwichesList tr').remove();

            _(wichs).keys().forEach(function(name){
                $('#tableSandwichesList').append(tablePersonLine({
                    person: name,
                    sandwich: wichs[name],
                }));
            });

            $('#tableSandwichesCount tr').remove();

            _(wichs).values().countBy().pairs().forEach(function(count){
                $('#tableSandwichesCount').append(tableCountLine({
                    count: count[1],
                    sandwich: count[0],
                }));
            });

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
                    updateTable();
                },
            });
        });
    }

    function cleanName(name){
        return name.toLowerCase().replace(/[^a-z]/g, '');
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
                { minLength: 3, highlight: true },
                { source: query(data.dishes) }
            );

        });

    }

    $(document).ready(function(){

        updateTable();
        setInterval(updateTable, TIMEOUT);

        activateAutocomplete();

        activateSubmit();
    });
})();
