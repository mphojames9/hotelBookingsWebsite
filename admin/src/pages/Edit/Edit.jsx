import React, { useEffect, useMemo, useState } from 'react';
import './Edit.css';
import '../Add/Add.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errorMessage } from '../../api';
import { toast } from 'react-toastify';
import { ImageIcon, ChevronDownIcon, ChevronLeftIcon, BedIcon } from '../../components/Icons';
import { formatRand } from '../../utils/format';
import { ROOM_TYPES } from '../../utils/categories';
import { cleanSpecs, toRows } from '../../utils/specs';
import { prepareImage } from '../../utils/images';
import SpecsEditor from '../../components/SpecsEditor/SpecsEditor';
import GalleryEditor, { fromSaved } from '../../components/GalleryEditor/GalleryEditor';

const Edit = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [status,setStatus] = useState("loading");   // loading | ready | missing | error
    const [product,setProduct] = useState(null);      // the room as it is saved right now
    const [data,setData] = useState(null);            // the form values
    const [specRows,setSpecRows] = useState([]);       // the specifications editor rows
    const [photos,setPhotos] = useState([]);          // the gallery: saved photos + new ones, first is the cover
    const [saving,setSaving] = useState(false);

    // load the room (the list endpoint only returns text fields, so this is cheap)
    useEffect(()=>{
        let cancelled = false;
        setStatus("loading");
        (async ()=>{
            try {
                const response = await api.get("/api/room/list");
                if (cancelled) return;
                if (!response.data.success) {
                    setStatus("error");
                    return;
                }
                const found = response.data.data.find((item)=>item._id === id);
                if (!found) {
                    setStatus("missing");
                    return;
                }
                setProduct(found);
                setData({
                    name:found.name,
                    description:found.description,
                    price:String(found.price),
                    maxGuests:String(found.maxGuests ?? 2),
                    totalRooms:String(found.totalRooms ?? 1),
                    category:found.category
                });
                setSpecRows(toRows(found.specs));
                setPhotos(fromSaved(found.images?.length ? found.images : [found.image]));
                setStatus("ready");
            } catch (error) {
                if (cancelled) return;
                toast.error(errorMessage(error,"Could not load this room"));
                setStatus("error");
            }
        })();
        return ()=>{ cancelled = true; };
    },[id]);

    const cover = photos[0]?.url || null;

    // changes to the gallery: a photo added, removed or moved
    const photoSignature = photos.map((photo)=>photo.kind === "existing" ? photo.name : `new:${photo.key}`).join("|");
    const savedSignature = product ? (product.images?.length ? product.images : [product.image]).join("|") : "";

    const dirty = useMemo(()=>{
        if (!product || !data) return false;
        return (
            photoSignature !== savedSignature ||
            data.name.trim() !== product.name ||
            data.description.trim() !== product.description ||
            Number(data.price) !== product.price ||
            Number(data.maxGuests) !== (product.maxGuests ?? 2) ||
            Number(data.totalRooms) !== (product.totalRooms ?? 1) ||
            data.category !== product.category ||
            JSON.stringify(cleanSpecs(specRows).specs) !== JSON.stringify(product.specs || [])
        );
    },[product,data,photoSignature,savedSignature,specRows]);

    const previewSpecs = useMemo(()=>cleanSpecs(specRows).specs,[specRows]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((current)=>({...current,[name]:value}));
    }

    const onsubmitHandler = async (event) => {
        event.preventDefault();
        if (saving || !dirty) return;

        if (photos.length === 0) {
            toast.error("A room needs at least one photo");
            return;
        }
        const { specs, incomplete } = cleanSpecs(specRows);
        if (incomplete > 0) {
            toast.error("Give every amenity both a name and a value");
            return;
        }

        setSaving(true);
        try {
            // saved photos are kept by name, new ones are uploaded (shrunk first); `layout` is the final order
            const picked = photos.filter((photo)=>photo.kind === "new");
            const files = await Promise.all(picked.map((photo)=>prepareImage(photo.file)));
            const layout = photos.map((photo)=>photo.kind === "existing" ? {name:photo.name} : {upload:picked.indexOf(photo)});

            const formData = new FormData();
            formData.append("id",product._id);
            formData.append("name",data.name.trim());
            formData.append("description",data.description.trim());
            formData.append("price",Number(data.price));
            formData.append("category",data.category);
            formData.append("maxGuests",data.maxGuests);
            formData.append("totalRooms",data.totalRooms);
            formData.append("specs",JSON.stringify(specs));
            formData.append("layout",JSON.stringify(layout));
            files.forEach((file)=>formData.append("images",file));

            const response = await api.post("/api/room/update",formData);
            if (response.data.success) {
                toast.success(response.data.message);
                navigate("/rooms");
                return;
            }
            toast.error(response.data.message);
        } catch (error) {
            toast.error(errorMessage(error));
        } finally {
            setSaving(false);
        }
    }

    const head = (
        <div className="page-head">
            <div>
                <Link to="/rooms" className="edit-back"><ChevronLeftIcon size={18} />Rooms</Link>
                <h1>Edit room</h1>
                <p>Change the photos or details guests see.</p>
            </div>
        </div>
    );

    if (status === "loading") {
        return (
            <div className="add edit">
                {head}
                <div className="add-layout" aria-hidden="true">
                    <div className="add-form card">
                        <div className="skeleton edit-skel-photo"/>
                        <div className="skeleton edit-skel-line"/>
                        <div className="skeleton edit-skel-area"/>
                        <div className="skeleton edit-skel-line"/>
                    </div>
                </div>
            </div>
        );
    }

    if (status !== "ready") {
        return (
            <div className="add edit">
                {head}
                <div className="card">
                    <div className="empty">
                        <span className="empty-icon"><BedIcon size={32} /></span>
                        <h3>{status === "missing" ? "Room not found" : "Could not load this room"}</h3>
                        <p>{status === "missing" ? "It may have been removed from your hotel." : "Check your connection and try again."}</p>
                        <Link to="/rooms" className="btn btn-primary">Back to rooms</Link>
                    </div>
                </div>
            </div>
        );
    }

    // keep a room type that is no longer in the standard list, so saving never changes it silently
    const categories = ROOM_TYPES.includes(product.category) ? ROOM_TYPES : [product.category,...ROOM_TYPES];

    return (
        <div className="add edit">

            {head}

            <div className="add-layout">
                <form className="add-form card" onSubmit={onsubmitHandler}>

                    <section className="add-section">
                        <GalleryEditor items={photos} onChange={setPhotos} disabled={saving} />
                    </section>

                    <section className="add-section">
                        <h2>Details</h2>

                        <div className="field-block">
                            <label htmlFor="name">Room name</label>
                            <input className="control" id="name" onChange={onChangeHandler} value={data.name} type='text' name='name' placeholder='e.g. Deluxe Sea View' autoComplete="off" required />
                        </div>

                        <div className="field-block">
                            <label htmlFor="description">Description</label>
                            <textarea className="control" id="description" onChange={onChangeHandler} value={data.description} name='description' rows='5' placeholder='Describe the room, the bed and what makes it special' required></textarea>
                        </div>

                        <div className="add-row">
                            <div className="field-block">
                                <label htmlFor="category">Room type</label>
                                <div className="select-wrap">
                                    <select className="control" id="category" onChange={onChangeHandler} value={data.category} name="category">
                                        {categories.map((category)=>(
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    <ChevronDownIcon size={18} />
                                </div>
                            </div>

                            <div className="field-block">
                                <label htmlFor="price">Rate per night</label>
                                <div className="control-wrap">
                                    <span className="price-prefix">R</span>
                                    <input className="control-bare" id="price" onChange={onChangeHandler} value={data.price} type='number' inputMode="decimal" min='1' step='0.01' name='price' placeholder='1800' required />
                                </div>
                            </div>
                        </div>

                        <div className="add-row">
                            <div className="field-block">
                            <label htmlFor="maxGuests">Sleeps (guests per room)</label>
                            <input className="control" id="maxGuests" onChange={onChangeHandler} value={data.maxGuests} type='number' inputMode="numeric" min='1' step='1' name='maxGuests' placeholder='2' required />
                        </div>
                            <div className="field-block">
                            <label htmlFor="totalRooms">Rooms of this type</label>
                            <input className="control" id="totalRooms" onChange={onChangeHandler} value={data.totalRooms} type='number' inputMode="numeric" min='1' step='1' name='totalRooms' placeholder='4' required />
                        </div>
                    </div>
                    <small className="field-help">Guests can book up to this many rooms of this type for the same nights.</small>
                    </section>

                    <section className="add-section">
                        <SpecsEditor rows={specRows} onChange={setSpecRows} category={data.category} />
                    </section>

                    <div className="edit-actions">
                        <button className="btn btn-primary add-btn" type='submit' disabled={saving || !dirty}>
                            {saving && <span className="spinner" aria-hidden="true" />}
                            {saving ? "Saving..." : "Save changes"}
                        </button>
                        <Link to="/rooms" className="btn btn-ghost edit-cancel" aria-disabled={saving}>Cancel</Link>
                    </div>
                </form>

                <aside className="add-preview" aria-label="Room preview">
                    <p className="preview-title">Preview</p>
                    <article className="preview-card card">
                        <div className="preview-media">
                            {cover ? <img src={cover} alt="" /> : <ImageIcon size={34} />}
                            {photos.length > 1 && <span className="preview-count">{photos.length} photos</span>}
                        </div>
                        <div className="preview-body">
                            <span className="chip">{data.category}</span>
                            <h3 className={data.name ? "" : "is-placeholder"}>{data.name || "Room name"}</h3>
                            <p className={data.description ? "" : "is-placeholder"}>{data.description || "Your description will appear here."}</p>
                            {previewSpecs.length > 0 &&
                                <ul className="preview-specs">
                                    {previewSpecs.slice(0,4).map((spec)=>(
                                        <li key={spec.label}><span>{spec.label}</span><strong>{spec.value}</strong></li>
                                    ))}
                                </ul>
                            }
                            <p className="preview-meta">Sleeps {data.maxGuests || 2} · {data.totalRooms || 1} {Number(data.totalRooms) === 1 ? "room" : "rooms"}</p>
                            <strong>{data.price ? formatRand(data.price) : "R 0.00"} <span className="preview-night">/ night</span></strong>
                        </div>
                    </article>
                </aside>
            </div>

        </div>
    );
}

export default Edit;
