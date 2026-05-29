import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";

import { useNavigate } from "react-router-dom";

import { useState } from "react";

import "./Items.css";

const itemsData = [

  {
    id:1,
    status:"Lost",
    name:"iPhone 14 Pro",
    category:"Mobile",
    location:"Lahore",
    image:"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:2,
    status:"Found",
    name:"Black Wallet",
    category:"Wallet",
    location:"Karachi",
    image:"https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:3,
    status:"Lost",
    name:"HP Laptop",
    category:"Laptop",
    location:"Islamabad",
    image:"https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:4,
    status:"Found",
    name:"Car Keys",
    category:"Keys",
    location:"Multan",
    image:"https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:5,
    status:"Lost",
    name:"Smart Watch",
    category:"Watch",
    location:"Faisalabad",
    image:"https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:6,
    status:"Found",
    name:"Backpack",
    category:"Bag",
    location:"Rawalpindi",
    image:"https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:7,
    status:"Lost",
    name:"Bluetooth AirPods",
    category:"Accessories",
    location:"Sialkot",
    image:"https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:8,
    status:"Found",
    name:"University Bag",
    category:"Bag",
    location:"Hyderabad",
    image:"https://images.unsplash.com/photo-1581605405669-fcdf81165afa?q=80&w=1200&auto=format&fit=crop"
  },

  {
    id:9,
    status:"Lost",
    name:"Passport",
    category:"Documents",
    location:"Peshawar",
    image:"https://images.unsplash.com/photo-1521791136064-7986c2920216?q=80&w=1200&auto=format&fit=crop"
  }

];

export default function Items(){

  const [sidebarOpen,setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  return(

    <div className="items-page">

      <Navbar
        toggleSidebar={()=>
          setSidebarOpen(prev => !prev)
        }
      />

      <div className="items-container">

        <Sidebar open={sidebarOpen} />

        <main className="items-main">

          {/* HEADER */}

          <div className="items-header">

            <div>

              <h1>
                Lost & Found Items
              </h1>

              <p>
                Search and explore reported item cases
              </p>

            </div>

          </div>

          {/* ACTIONS */}

          <div className="items-actions">

            <button
              className="lost-item-btn"
              onClick={() => navigate("/report-lost-item")}
            >
              Lost Item
            </button>

            <button
              className="found-item-btn"
              onClick={() => navigate("/report-found-item")}
            >
              Found Item
            </button>

          </div>

          {/* FILTERS */}

          <div className="items-filters">

            <input
              type="text"
              placeholder="Search by item name..."
            />

            <select>
              <option>All Categories</option>
              <option>Mobile</option>
              <option>Wallet</option>
              <option>Laptop</option>
              <option>Documents</option>
              <option>Pets</option>
              <option>Others</option>
            </select>

            <select>
              <option>All Cities</option>
              <option>Lahore</option>
              <option>Karachi</option>
              <option>Islamabad</option>
            </select>

            <select>
              <option>By Status</option>
              <option>Lost</option>
              <option>Found</option>
            </select>

          </div>

          {/* GRID */}

          <div className="items-grid">

            {itemsData.map((item)=>(

              <div
                key={item.id}
                className="item-card"
              >

                <div className={`item-status ${
                  item.status === "Found"
                    ? "status-found"
                    : "status-lost"
                }`}>

                  {item.status}

                </div>

                <img
                  src={item.image}
                  alt={item.name}
                />

                <div className="item-card-content">

                  <h3>
                    {item.name}
                  </h3>

                  <p>
                    Category: {item.category}
                  </p>

                  <p>
                    Location: {item.location}
                  </p>

                  <button>
                    View Details
                  </button>

                </div>

              </div>

            ))}

          </div>
             <Footer />

        </main>
       

      </div>

    </div>
  );
}