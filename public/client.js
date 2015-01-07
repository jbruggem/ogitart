(function(){

    var URL_DATA = '/data';
    var TIMEOUT = 5000;

    var tablePersonLine = _.template('<tr> <td><%= person %></td> <td ><%= sandwich %></td>     </tr>');
    var tableCountLine = _.template('<tr> <td><%= sandwich %></td> <td ><%= count %></td>     </tr>');

    function updateTable(){
        $.getJSON(URL_DATA, function( data ){
            var wichs = _.zipObject(data.sandwiches);

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

    $(document).ready(function(){

        updateTable();
        setInterval(updateTable, TIMEOUT);

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
                data: JSON.stringify({ 'sandwiches': [[name, swich]] }),
                success: function( data ){
                    console.log('submit end');
                    console.log(data);
                    updateTable();
                },
            });
        });

    });
})();