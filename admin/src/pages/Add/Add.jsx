import React, { useMemo, useState } from 'react';
import './Add.css';
import api, { errorMessage } from '../../api';
import { toast } from 'react-toastify';
import { ImageIcon, ChevronDownIcon } from '../../components/Icons';
import { formatRand } from '../../utils/format';
import { ROOM_TYPES, LOCATIONS } from '../../utils/categories';
import { cleanSpecs } from '../../utils/specs';
import { prepareImage } from '../../utils/images';
import SpecsEditor from '../../components/SpecsEditor/SpecsEditor';
import GalleryEditor from '../../components/GalleryEditor/GalleryEditor';

const emptyData = {
    name:"",
    description:"",
    price:"",
    maxGuests:"2",
    totalRooms:"1",
    category:"Standard",
    location:""
};

const Add = () => {

    const [photos,setPhotos] = useState([]);       // the gallery: first photo is the cover
    const [loading,setLoading] = useState(false);
    const [data,setData] = useState(emptyData);
    const [specRows,setSpecRows] = useState([]);
    const previewSpecs = useMemo(()=>cleanSpecs(specRows).specs,[specRows]);
    const cover = photos[0]?.url || null;

    const onChangeHandler = (event) => {
        const name = event.target.name;
        const value = event.target.value;
        setData(data=>({...data,[name]:value}))
    }

    const onsubmitHandler = async (event) => {
        event.preventDefault();
        if (loading) return;

        if (photos.length === 0) {
            toast.error("Add at least one photo");
            return;
        }
        const { specs, incomplete } = cleanSpecs(specRows);
        if (incomplete > 0) {
            toast.error("Give every amenity both a name and a value");
            return;
        }

        setLoading(true);
        try {
            // big camera photos are shrunk first, then sent in gallery order
            const files = await Promise.all(photos.map((photo)=>prepareImage(photo.file)));
            const formData = new FormData();
            formData.append("name",data.name)
            formData.append("description",data.description)
            formData.append("price",Number(data.price))
            formData.append("category",data.category)
            formData.append("location",data.location)
            formData.append("maxGuests",data.maxGuests)
            formData.append("totalRooms",data.totalRooms)
            formData.append("specs",JSON.stringify(specs))
            files.forEach((file)=>formData.append("images",file))

            const response = await api.post("/api/room/add",formData);
            if (response.data.success) {
                setData(emptyData)
                setSpecRows([])
                setPhotos([])
                toast.success(response.data.message)
            }else{
                toast.error(response.data.message)
            }
        } catch (error) {
            toast.error(errorMessage(error))
        } finally {
            setLoading(false);
        }
    }

  return (
    <div className='add'>

        <div className="page-head">
            <div>
                <h1>Add room</h1>
                <p>Add photos and the details guests will see when they book.</p>
            </div>
        </div>

        <div className="add-layout">
            <form className="add-form card" onSubmit={onsubmitHandler}>

                <section className="add-section">
                    <GalleryEditor items={photos} onChange={setPhotos} disabled={loading} />
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
                                    {ROOM_TYPES.map((category)=>(
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
                            <label htmlFor="location">Hotel location</label>
                            <div className="select-wrap">
                                <select className="control" id="location" onChange={onChangeHandler} value={data.location} name="location">
                                    <option value="">Not assigned</option>
                                    {LOCATIONS.map((place)=>(
                                        <option key={place} value={place}>PrimeStay {place}</option>
                                    ))}
                                </select>
                                <ChevronDownIcon size={18} />
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

                <button className="btn btn-primary add-btn" type='submit' disabled={loading}>
                    {loading && <span className="spinner" aria-hidden="true" />}
                    {loading ? "Adding..." : "Add room"}
                </button>
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

export default Add;
