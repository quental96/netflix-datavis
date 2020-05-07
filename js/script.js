const b_width = 1000;
const d_width = 500;
const b_height = 1000;
const d_height = 1000;
const colors = [
    '#DB202C','#a6cee3','#1f78b4',
    '#33a02c','#fb9a99','#b2df8a',
    '#fdbf6f','#ff7f00','#cab2d6',
    '#6a3d9a','#ffff99','#b15928'];


const radius = d3.scaleLinear().range([.5, 20]);
const color = d3.scaleOrdinal().range(colors);
const x = d3.scaleLinear().range([0, b_width]);


const bubble = d3.select('.bubble-chart')
    .attr('width', b_width).attr('height', b_height);

const donut = d3.select('.donut-chart')
    .attr('width', d_width).attr('height', d_height)
    .append('g')
    .attr('transform', `translate(${d_width / 2},${d_height / 2})`);

const donut_lable = d3.select('.donut-chart').append('text')
    .attr('class', 'donut-lable')
    .attr('text-anchor', 'middle')
    .attr('transform', `translate(${(d_width/2)} ${d_height/2})`);

const tooltip = d3.select('.tooltip');

//  Part 1 - Create simulation with forceCenter(), forceX() and forceCollide()
const simulation = d3.forceSimulation()
    .force('center', d3.forceCenter(b_width/2, b_height/2))
    .force('x', d3.forceX(d=> x(+d['release year'])))
    .force('collide', d3.forceCollide(d=> radius(+d['user rating score']+3)));
    // ..


d3.csv('data/netflix.csv').then(data=>{
    data = d3.nest().key(d=>d.title).rollup(d=>d[0]).entries(data).map(d=>d.value).filter(d=>d['user rating score']!=='NA');
    //console.log(data)
    
    const rating = data.map(d=>+d['user rating score']);
    const years = data.map(d=>+d['release year']);
    let ratings = d3.nest().key(d=>d.rating).rollup(d=>d.length).entries(data);
    
    
    // Part 1 - add domain to color, radius and x scales 
    x.domain([d3.min(years), d3.max(years)]);
    radius.domain([d3.min(rating), d3.max(rating)]);
    color.domain(ratings);
    // ..
    
    // Part 1 - create circles
    var nodes = bubble
        .selectAll('circle')
        .data(data)
        .enter().append('circle')
        .attr('r', d=> radius(+d['user rating score']))
        .attr('fill', d=> color(d.rating))
        .on('mouseover', overBubble)
        .on('mouseout', outOfBubble);

    
    // Part 1 - add data to simulation and add tick event listener 
    simulation.nodes(data).on('tick', ticked);

    function ticked() {
        nodes
            .attr('cx', function(d) { return d.x; })
            .attr('cy', function(d) { return d.y; })
    }
    // ..

    // Part 1 - create layout with d3.pie() based on rating
    var pie = d3.pie().value(function(d) { return d.value; });
    // ..
    
    // Part 1 - create an d3.arc() generator
    var arc = d3.arc()
        .innerRadius(d_width/4)
        .outerRadius(d_width/2)
        .padAngle(0.02)
        .cornerRadius(10);
    // ..
    
    // Part 1 - draw a donut chart inside donut
    donut.selectAll('path')
        .data(pie(ratings))
        .enter().append('path')
        .attr('d', arc) 
        .attr('fill', d=> color(d.data.key))
        .style('opacity', 1.0)
        .on('mouseover', overArc)
        .on('mouseout', outOfArc);

    function overBubble(d){
        //console.log(d)
        // Part 2 - add stroke and stroke-width 
        bubble.selectAll('circle').filter(function(e) { return e == d; })
            .attr('stroke', 'black')
            .style('stroke-width', '2px');
        // ..
        
        // Part 3 - update tooltip content with title and year
        tooltip.html(d.title+'<br><span style = "color:grey;">'+d['release year']+'</span>');
        // ..

        // Part 3 - change visibility and position of tooltip
        tooltip.style('display', 'inline')
            .style('top', `${d3.mouse(this)[1]}px`)
            .style('left',`${d3.mouse(this)[0] + 10}px`);
        // ..
    }
    function outOfBubble(){
        // Part 2 - remove stroke and stroke-width
        bubble.selectAll('circle')
            .attr('stroke', null)
            .style('stroke-width', null);
        // ..
            
        // Part 3 - change visibility of tooltip
        tooltip.style("display", "none");
        // ..
    }

    function overArc(d){
        //console.log(d)
        // Part 2 - change donut_lable content
        donut_lable.text(d.data.key);
        // ..

        // Part 2 - change opacity of an arc
        donut.selectAll('path').filter(function(e) { return e == d; })
            .style('opacity', 0.3);
        // ..

        // Part 3 - change opacity, stroke and stroke-width of circles based on rating
        bubble.selectAll('circle').filter(function(e) { return e.rating != d.data.key; })
            .style('opacity', 0.3);
        bubble.selectAll('circle').filter(function(e) { return e.rating == d.data.key; })
            .attr('stroke', 'black')
            .style('stroke-width', '2px');
        // ..
    }
    function outOfArc(){
        // Part 2 - change content of donut_lable
        donut_lable.text('');
        // ..

        // Part 2 - change opacity of an arc
        donut.selectAll('path')
            .style('opacity', 1.0);
        // ..

        // Part 3 - revert opacity, stroke and stroke-width of circles
        bubble.selectAll('circle')
            .style('opacity', 1.0)
            .attr('stroke', null)
            .style('stroke-width', null);
        // ..
    }
});
