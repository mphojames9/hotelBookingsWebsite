import React, { useEffect, useMemo, useRef, useState } from 'react';
import './Edit.css';
import '../Add/Add.css';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { API_URL, errorMessage } from '../../api';
import { toast } from 'react-toastify';
import { ImageIcon, CloseIcon, ChevronDownIcon, ChevronLeftIcon, BedIcon } from '../../components/Icons';
import { formatRand } from '../../utils/format';
import { ROOM_TYPES } from '../../utils/categories';
import { cleanSpecs, toRows } from '../../utils/specs';
import SpecsEditor from '../../components/SpecsEditor/SpecsEditor';

const Edit = () => {

    const { id } = useParams();
    const navigate = useNavigate();

    const [status,setStatus] = useState("loading");   // loading | ready | missing | error
    const [product,setProduct] = useState(null);      // the room as it is saved right now
    const [data,setData] = useState(null);            // the form values
    const [specRows,setSpecRows] = useState([]);       // the specifications editor rows
    const [image,setImage] = useState(null);          // a newly picked photo (null = keep the current one)
    const [currentBroken,setCurrentBroken] = useState(false);
    const [dragging,setDragging] = useState(false);
    const [saving,setSaving] = useState(false);
    const inputRef = useRef(null);

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
                setImage(null);
                setCurrentBroken(false);
                setStatus("ready");
            } catch (error) {
                if (cancelled) return;
                toast.error(errorMessage(error,"Could not load this room"));
                setStatus("error");
            }
        })();
        return ()=>{ cancelled = true; };
    },[id]);

    // one object URL per newly picked file, released when the file changes
    const newPreview = useMemo(()=> image ? URL.createObjectURL(image) : null,[image]);
    useEffect(()=>()=>{ if (newPreview) URL.revokeObjectURL(newPreview); },[newPreview]);

    const currentUrl = product ? `${API_URL}/images/${product.image}` : null;
    const shownImage = newPreview || (currentBroken ? null : currentUrl);

    const dirty = useMemo(()=>{
        if (!product || !data) return false;
        return (
            !!image ||
            data.name.trim() !== product.name ||
            data.description.trim() !== product.description ||
            Number(data.price) !== product.price ||
            Number(data.maxGuests) !== (product.maxGuests ?? 2) ||
            Number(data.totalRooms) !== (product.totalRooms ?? 1) ||
            data.category !== product.category ||
            JSON.stringify(cleanSpecs(specRows).specs) !== JSON.stringify(product.specs || [])
        );
    },[product,data,image,specRows]);

    const previewSpecs = useMemo(()=>cleanSpecs(specRows).specs,[specRows]);

    const onChangeHandler = (event) => {
        const { name, value } = event.target;
        setData((current)=>({...current,[name]:value}));
    }

    const onFileChange = (event) => {
        const file = event.target.files[0];
        if (file) setImage(file);
    }

    // drop the newly picked photo and go back to the saved one
    const undoImage = (event) => {
        event.preventDefault();
        event.stopPropagation();
        setImage(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    const onsubmitHandler = async (event) => {
        event.preventDefault();
        if (saving || !dirty) return;

        const { specs, incomplete } = cleanSpecs(specRows);
        if (incomplete > 0) {
            toast.error("Give every amenity both a name and a value");
            return;
        }

        const formData = new FormData();
        formData.append("id",product._id);
        formData.append("name",data.name.trim());
        formData.append("description",data.description.trim());
        formData.append("price",Number(data.price));
        formData.append("category",data.category);
        formData.append("maxGuests",data.maxGuests);
        formData.append("totalRooms",data.totalRooms);
        formData.append("specs",JSON.stringify(specs));
        if (image) formData.append("image",image);

        setSaving(true);
        try {
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
                <p>Change the photo or details guests see.</p>
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
                        <h2>Photo</h2>
                        <label
                            className={`dropzone${dragging?" is-dragging":""}${shownImage?" has-image":""}`}
                            onDragEnter={()=>setDragging(true)}
                            onDragLeave={()=>setDragging(false)}
                            onDrop={()=>setDragging(false)}
                        >
                            <input
                                ref={inputRef}
                                className="dropzone-input"
                                onChange={onFileChange}
                                type='file'
                                id='image'
                                accept='image/*'
                            />
                            {shownImage ? (
                                <>
                                    <img
                                        key={shownImage}
                                        src={shownImage}
                                        alt="Room"
                                        onError={()=>{ if (!newPreview) setCurrentBroken(true); }}
                                    />
                                    <span className="dropzone-change">{newPreview ? "New photo selected" : "Change photo"}</span>
                                    {newPreview &&
                                        <button type="button" className="dropzone-clear" onClick={undoImage} aria-label="Keep the current photo">
                                            <CloseIcon size={16} />
                                        </button>
                                    }
                                </>
                            ) : (
                                <span className="dropzone-empty">
                                    <span className="dropzone-icon"><ImageIcon size={28} /></span>
                                    <strong>{currentBroken ? "Current photo is missing" : "Tap to upload a photo"}</strong>
                                    <span>{currentBroken ? "Upload a new photo to replace it" : "or drag and drop an image here"}</span>
                                </span>
                            )}
                        </label>
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
                            {shownImage ? <img src={shownImage} alt="" /> : <ImageIcon size={34} />}
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
