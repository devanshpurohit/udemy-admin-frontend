import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import aiCardService from '../../services/aiCardService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faCreditCard, faTrash } from "@fortawesome/free-solid-svg-icons";

function AICardGenerator() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    useEffect(() => {
        fetchCards();
    }, []);

    const fetchCards = async () => {
        try {
            setLoading(true);
            const data = await aiCardService.getCards();
            if (data.success) {
                setCards(data.data);
            }
        } catch (error) {
            console.error('Error fetching cards:', error);
            toast.error('Failed to fetch cards');
        } finally {
            setLoading(false);
        }
    };

    const generateCard = async () => {
        try {
            setGenerating(true);
            const data = await aiCardService.generateCard();
            if (data.success) {
                toast.success('AI Card generated successfully!');
                setCards([data.data, ...cards]);
            } else {
                toast.error(data.message || 'Failed to generate card');
            }
        } catch (error) {
            console.error('Error generating card:', error);
            toast.error(typeof error === 'string' ? error : 'Server error while generating card');
        } finally {
            setGenerating(false);
        }
    };

    const handleDeleteCard = async (id) => {
        if (!window.confirm("Are you sure you want to delete this AI Card? This action cannot be undone.")) {
            return;
        }

        try {
            const data = await aiCardService.deleteCard(id);
            if (data.success) {
                toast.success('AI Card deleted successfully!');
                setCards(cards.filter(card => card._id !== id));
            } else {
                toast.error(data.message || 'Failed to delete card');
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            toast.error('Server error while deleting card');
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <h3 className="mb-0">AI Card Generator</h3>
                    <p className="text-muted">Generate random AI cards for testing and special access</p>
                </div>
                <div className="col-auto">
                    <button 
                        className="btn btn-primary d-flex align-items-center gap-2"
                        onClick={generateCard}
                        disabled={generating}
                    >
                        {generating ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            <FontAwesomeIcon icon={faPlus} />
                        )}
                        {generating ? 'Generating...' : 'Generate AI Card'}
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover mb-0 admin-table">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="ps-4">S.No</th>
                                            <th>Card Number</th>
                                            <th>CVV</th>
                                            <th>Expiry</th>
                                            <th>Card Holder</th>
                                            <th>Status</th>
                                            <th>Generated Date</th>
                                            <th className="pe-4 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="8" className="text-center py-5">
                                                    <div className="spinner-border text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : cards.length > 0 ? (
                                            cards.map((card, index) => (
                                                <tr key={card._id}>
                                                    <td className="ps-4 text-muted">{String(index + 1).padStart(2, '0')}.</td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <div className="bg-primary-subtle p-2 rounded text-primary">
                                                                <FontAwesomeIcon icon={faCreditCard} />
                                                            </div>
                                                            <span className="fw-medium">{card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</span>
                                                        </div>
                                                    </td>
                                                    <td><code>{card.cvv}</code></td>
                                                    <td>{card.expiryDate}</td>
                                                    <td>{card.cardHolder}</td>
                                                    <td>
                                                        <span className={`badge rounded-pill ${
                                                            card.status === 'active' ? 'bg-success' : 
                                                            card.status === 'inuse' ? 'bg-warning text-dark' : 
                                                            'bg-secondary'
                                                        }`}>
                                                            {card.status}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">
                                                        {new Date(card.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="pe-4 text-end">
                                                        <button 
                                                            className="btn btn-outline-danger btn-sm"
                                                            onClick={() => handleDeleteCard(card._id)}
                                                            title="Delete Card"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center py-5">
                                                    <div className="text-muted mb-2">
                                                        <FontAwesomeIcon icon={faCreditCard} size="2x" />
                                                    </div>
                                                    <h5>No AI Cards generated yet</h5>
                                                    <p>Click the generate button to create your first card.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AICardGenerator;

