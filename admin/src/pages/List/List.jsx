import React, { useEffect, useMemo, useState } from 'react';
import './List.css';
import { Link } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../../api';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog/ConfirmDialog';
import { ImageIcon, PlusIcon, SearchIcon, TrashIcon, BedIcon, PencilIcon } from '../../components/Icons';
import { formatRand, wait } from '../../utils/format';

const List = () => {

    const [list,setList] = useState([]);
    const [loading,setLoading] = useState(true);
    const [query,setQuery] = useState("");
    const [target,setTarget] = useState(null);     // room waiting for delete confirmation
    const [removing,setRemoving] = useState(false);
    const [leavingId,setLeavingId] = useState(null);

    const fetchList = async () => {
      try {
        const response = await api.get("/api/room/list");
        if (response.data.success){
          setList(response.data.data)
        } else {
          toast.error("Error")
        }
      } catch (error) {
        toast.error(errorMessage(error,"Could not load rooms"))
      } finally {
        setLoading(false);
      }
    }

    const removeRoom = async () => {
      if (!target) return;
      const roomId = target._id;
      setRemoving(true);
      try {
        const response = await api.post("/api/room/remove",{id:roomId});
        setTarget(null);
        if (response.data.success) {
          setLeavingId(roomId);   // let the row animate out before the list refreshes
          await wait(320);
        }
        await fetchList();
        setLeavingId(null);
        if (response.data.success) {
          toast.success(response.data.message)
        }else{
          toast.error(response.data.message);
        }
      } catch (error) {
        setTarget(null);
        toast.error(errorMessage(error))
      } finally {
        setRemoving(false);
      }
    }

    useEffect(()=>{
      fetchList()
    },[])

    const visible = useMemo(()=>{
      const q = query.trim().toLowerCase();
      if (!q) return list;
      return list.filter((item)=>
        (item.name || "").toLowerCase().includes(q) ||
        (item.category || "").toLowerCase().includes(q)
      );
    },[list,query]);

  return (
    <div className="list">

      <div className="page-head">
        <div>
          <h1>Rooms</h1>
          <p>{loading ? "Loading rooms..." : `${list.length} ${list.length === 1 ? "room type" : "room types"} in your hotel`}</p>
        </div>
        <Link to="/add" className="btn btn-primary"><PlusIcon size={18} />Add room</Link>
      </div>

      {(loading || list.length > 0) &&
        <label className="control-wrap list-search">
          <SearchIcon size={18} />
          <input
            className="control-bare"
            type="search"
            placeholder="Search by name or room type"
            aria-label="Search rooms"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </label>
      }

      <div className="card list-card">

        {loading &&
          <div aria-hidden="true">
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="list-row">
                <div className="skeleton skel-thumb"/>
                <div className="skeleton skel-line"/>
                <div className="skeleton skel-chip"/>
                <div className="skeleton skel-line short"/>
                <span/>
              </div>
            ))}
          </div>
        }

        {!loading && list.length === 0 &&
          <div className="empty">
            <span className="empty-icon"><BedIcon size={32} /></span>
            <h3>No rooms yet</h3>
            <p>Add your first room and it will show up here and on the booking site.</p>
            <Link to="/add" className="btn btn-primary"><PlusIcon size={18} />Add room</Link>
          </div>
        }

        {!loading && list.length > 0 && visible.length === 0 &&
          <div className="empty">
            <span className="empty-icon"><SearchIcon size={30} /></span>
            <h3>No matches</h3>
            <p>Nothing matches “{query.trim()}”. Try a different name or room type.</p>
          </div>
        }

        {!loading && visible.length > 0 &&
          <>
            <div className="list-row list-head" aria-hidden="true">
              <span/>
              <span>Name</span>
              <span>Room type</span>
              <span>Rate</span>
              <span/>
            </div>
            {visible.map((item,index)=>(
              <div key={item._id} className={`list-row rise${leavingId === item._id ? " is-leaving" : ""}`} style={{'--i':index}}>
                <div className="thumb">
                  <ImageIcon size={22} />
                  <img
                    src={`${API_URL}/images/`+item.image}
                    alt=""
                    loading="lazy"
                    onError={(e)=>{ e.currentTarget.style.display = "none"; }}
                  />
                </div>
                <p className="list-name">
                  {item.name}
                  <small className="list-stock">{item.totalRooms || 1} {(item.totalRooms || 1) === 1 ? "room" : "rooms"} · sleeps {item.maxGuests || 2}</small>
                </p>
                <div className="list-meta">
                  <span className="chip">{item.category}</span>
                  {item.specs?.length > 0 && <span className="list-specs">{item.specs.length} {item.specs.length === 1 ? "amenity" : "amenities"}</span>}
                  <p className="list-price">{formatRand(item.price)}<small> / night</small></p>
                </div>
                <div className="list-actions">
                  <Link
                    to={`/edit/${item._id}`}
                    className="icon-btn accent"
                    aria-label={`Edit ${item.name}`}
                  >
                    <PencilIcon size={19} />
                  </Link>
                  <button
                    type="button"
                    className="icon-btn danger"
                    onClick={()=>setTarget(item)}
                    aria-label={`Remove ${item.name}`}
                  >
                    <TrashIcon size={19} />
                  </button>
                </div>
              </div>
            ))}
          </>
        }
      </div>

      <ConfirmDialog
        open={!!target}
        title="Remove this room?"
        message={target ? `“${target.name}” will be removed from your hotel and can no longer be booked.` : ""}
        confirmLabel="Remove room"
        busy={removing}
        onConfirm={removeRoom}
        onCancel={()=>setTarget(null)}
      />

    </div>
  );
}

export default List;
