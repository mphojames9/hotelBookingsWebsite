import React, { useContext, useEffect, useState } from 'react';
import './FoodDisplay.css';
import { StoreContext } from '../../context/StoreContext';
import FoodItem from '../FoodItem/FoodItem';
import { ChevronIcon, CloseIcon, SearchIcon, SparklesIcon } from '../Icons';
import { categoryLabel, formatPrice } from '../../utils/format';

const SORTS = {
    featured: { label: 'Featured', fn: null },
    low:  { label: 'Price: low to high', fn: (a,b)=>a.price-b.price },
    high: { label: 'Price: high to low', fn: (a,b)=>b.price-a.price },
    rated: { label: 'Top rated', fn: null },
    name: { label: 'Name: A to Z', fn: (a,b)=>String(a.name).localeCompare(String(b.name)) },
};

const FoodDisplay = ({category,setCategory,smart,onClearSmart,reveal}) => {

    const { food_list, ready, ratings } = useContext(StoreContext);
    const [query,setQuery] = useState('');
    const [sort,setSort] = useState('featured');
    const [minPrice,setMinPrice] = useState('');
    const [maxPrice,setMaxPrice] = useState('');

    const [pendingReveal,setPendingReveal] = useState(null);

    const q = query.trim().toLowerCase();
    // a Spotlight search hands us the matching ids, already ranked
    const order = smart ? new Map(smart.ids.map((id,i)=>[id,i])) : null;
    const min = minPrice===''?null:Number(minPrice);
    const max = maxPrice===''?null:Number(maxPrice);
    const priceFiltered = min!==null || max!==null;
    // price range of the products in the chosen category, shown as hints in the price boxes
    const inCategory = food_list.filter((item)=>category==='All' || category===item.category);
    const prices = inCategory.map((item)=>Number(item.price)||0);
    const lowest = prices.length ? Math.min(...prices) : 0;
    const highest = prices.length ? Math.max(...prices) : 0;
    let products = food_list.filter((item)=>
        (category==='All' || category===item.category) &&
        (min===null || item.price>=min) &&
        (max===null || item.price<=max) &&
        (!q || item.name?.toLowerCase().includes(q) || item.description?.toLowerCase().includes(q)) &&
        (!order || order.has(item._id))
    );
    if (order) products = [...products].sort((a,b)=>order.get(a._id)-order.get(b._id));
    if (sort==='rated') {
        const score = (item) => ratings[item._id] || {average:0,count:0};
        products = [...products].sort((a,b)=>(score(b).average-score(a).average)||(score(b).count-score(a).count));
    }
    if (SORTS[sort].fn) products = [...products].sort(SORTS[sort].fn);

    const hasToolbarChanges = sort!=='featured' || priceFiltered;
    const resetToolbar = () => { setSort('featured'); setMinPrice(''); setMaxPrice(''); }

    const clearFilters = () => {
        setQuery('');
        resetToolbar();
        setCategory('All');
        onClearSmart?.();
    }

    // "show in shop" from Spotlight: clear anything hiding the product, scroll to it, flash it
    useEffect(()=>{
        if (!reveal) return;
        setQuery('');
        setCategory('All');
        setPendingReveal(reveal);
    },[reveal]);

    // fade cards in as they scroll into view
    const idsKey = products.map((item)=>item._id).join(',');
    useEffect(()=>{
        const cards = document.querySelectorAll('.shop-grid .reveal:not(.in)');
        if (!('IntersectionObserver' in window)) {
            cards.forEach((card)=>card.classList.add('in'));
            return;
        }
        const observer = new IntersectionObserver((entries)=>{
            entries.forEach((entry)=>{
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    observer.unobserve(entry.target);
                }
            });
        },{rootMargin:'0px 0px -6% 0px',threshold:0.05});
        cards.forEach((card)=>observer.observe(card));
        return ()=>observer.disconnect();
    },[idsKey,ready,category]);

    useEffect(()=>{
        if (!pendingReveal || !ready) return;
        const timer = setTimeout(()=>{
            const card = document.getElementById(`product-${pendingReveal.id}`);
            if (card) {
                card.scrollIntoView({behavior:'smooth',block:'center'});
                card.classList.remove('flash');
                void card.offsetWidth; // restart the animation if it is already flashing
                card.classList.add('flash');
                setTimeout(()=>card.classList.remove('flash'),2400);
            }
            setPendingReveal(null);
        },160);
        return ()=>clearTimeout(timer);
    },[pendingReveal,ready,idsKey]);

    return (
    <section className='shop' id='food-display'>
        <div className="shop-head">
            <div>
                <h2>{smart?'Search results':category==='All'?'All products':categoryLabel(category)}</h2>
                {ready && <p>{products.length} {products.length===1?'product':'products'}</p>}
            </div>
            <label className="search">
                <SearchIcon />
                <input id="product-search" type="search" value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search products" aria-label="Search products" />
                {query && <button type="button" className="search-clear" aria-label="Clear search" onClick={()=>setQuery('')}><CloseIcon /></button>}
            </label>
        </div>

        <div className="toolbar" role="group" aria-label="Sort and filter products">
            <label className="tool-field">
                <span>Sort by</span>
                <span className="select">
                    <select value={sort} onChange={(e)=>setSort(e.target.value)}>
                        {Object.entries(SORTS).map(([key,item])=><option key={key} value={key}>{item.label}</option>)}
                    </select>
                    <ChevronIcon />
                </span>
            </label>

            <div className="tool-field">
                <span id="price-label">Price (R)</span>
                <div className="price-range" role="group" aria-labelledby="price-label">
                    <input type="number" inputMode="numeric" min="0" value={minPrice} onChange={(e)=>setMinPrice(e.target.value)} placeholder={ready?`Min ${formatPrice(lowest).slice(1)}`:'Min'} aria-label="Minimum price" />
                    <i aria-hidden="true">to</i>
                    <input type="number" inputMode="numeric" min="0" value={maxPrice} onChange={(e)=>setMaxPrice(e.target.value)} placeholder={ready?`Max ${formatPrice(highest).slice(1)}`:'Max'} aria-label="Maximum price" />
                </div>
            </div>

            {hasToolbarChanges &&
                <button type="button" className="tool-reset" onClick={resetToolbar}>Reset</button>
            }
        </div>

        {smart &&
            <div className="smart-chip" role="status">
                <SparklesIcon />
                <span>Spotlight search</span>
                <strong>{smart.label}</strong>
                <button type="button" onClick={onClearSmart} aria-label="Clear Spotlight search"><CloseIcon /></button>
            </div>
        }

        {!ready
            ? <div className="shop-grid" aria-busy="true">
                {Array.from({length:8}).map((_,i)=>(
                    <div key={i} className="product-skeleton">
                        <div className="sk-media" />
                        <div className="sk-line" />
                        <div className="sk-line sk-short" />
                    </div>
                ))}
              </div>
            : products.length===0
                ? <div className="shop-empty">
                    <span className="shop-empty-icon"><SearchIcon /></span>
                    <p>{food_list.length===0?'No products yet. Check back soon.':priceFiltered?'No products in that price range.':'No products match your search.'}</p>
                    {food_list.length>0 && <button type="button" className="btn btn-ghost" onClick={clearFilters}>Clear search and filters</button>}
                  </div>
                : <ul className="shop-grid" key={category}>
                    {products.map((item,i)=>(
                        <li key={item._id} className="reveal" style={{'--d':`${(i%4)*70}ms`}}>
                            <FoodItem id={item._id} name={item.name} description={item.description} price={item.price} image={item.image} specs={item.specs} stock={item.stock}/>
                        </li>
                    ))}
                  </ul>
        }
    </section>
  );
}

export default FoodDisplay;
