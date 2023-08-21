import Table from "@mui/material/Table";
import TableContainer from "@mui/material/TableContainer";
import Paper from "@mui/material/Paper";
import { useCallback, useEffect, useMemo, useState } from "react";
import ContextMenu from "../ContextMenu";
import useContextMenu from "../../hooks/useContextMenu";
import DownloadCSV from "../DownloadCSV";
import Tooltip from "@mui/material/Tooltip";
import { tableStyles } from "@/styles/table_styles";
import UndoIcon from "@mui/icons-material/Undo";
import IconButton from "@mui/material/IconButton";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import useAtinaCalls from "@/hooks/useAtinaCalls";
import { useSelector } from "react-redux";
import useColumns from "@/hooks/useColumns";
import ErrorModal from "../modals/ErrorModal";
import CustomTableHead from "./table_heads/CustomTableHead";
import CustomTableBody from "./table_bodies/CustomTableBody";
import useTableUtils from "@/hooks/table_hooks/useTableUtils";
import SSR_Pagination from "../SSR_Pagination";
import usePagination from "@/hooks/usePagination";
import Loading_Icon from "../Loading_Icon";
import useFilters from "@/hooks/useFilters";
import ProtocolTableRow from "../table_rows/ProtocolTableRow";
import ProtocolFilter from "../filters/ProtocolFilter";
import { Box } from "@mui/material";

// import axios from "axios";

const initalContextMenu = {
  show: false,
  x: 0,
  y: 0,
  point: "",
};

const protocolFilterParams = {
  protocolType: null,
  module: null,
  userId: null,
  userName: null,
  itemId: null,
  itemNumber: null,
  dateFrom: null,
  timeFrom: null,
  dateTo: null,
  timeTo: null,
  description: null,
  street: null,
  streetnumber: null,
  zip: null,
  city: null,
  country: null,
};

const ProtocolTable = () => {
  const { PROTOCOL_TABLE_COLUMNS } = useColumns();
  const [contextMenu, setContextMenu] = useState(initalContextMenu);
  const [allData, setAllData] = useState([]);
  const [resetResize, setResetResize] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [filterVal, setFilterVal] = useState(protocolFilterParams);

  //! User Credentials State ▼▼▼▼▼▼
  const { user } = useSelector((state) => state.settings);
  //! Bookings Data and Relevants ▼▼▼▼▼▼
  const { errorMsg, error, protocol, loading } = useSelector(
    (state) => state.atina
  );

  //! Pagination, Sorting and Filtering State ▼▼▼▼▼▼
  const { paginationParams, sortingParams, filterParams, searchTrigger } =
    useSelector((state) => state.tableUtils.protocol);

  //#region //! Custom Hooks ▼▼▼▼▼▼
  const { handleRightClick } = useContextMenu(contextMenu, setContextMenu);
  const { getProtocolData } = useAtinaCalls();
  const { filterProtocol, resetFilter } = useFilters();
  const { handleSortParams, makeUrlParams, handlePaginationParams } =
    usePagination("protocol");

  const defaultColumn = useMemo(
    () => ({
      minWidth: 75,
      width: 225,
      maxWidth: 400,
    }),
    []
  );
  const tableColumns = useMemo(() => PROTOCOL_TABLE_COLUMNS, [hiddenColumns]);
  const {
    headerGroups,
    getTableProps,
    getTableBodyProps,
    page,
    prepareRow,
    allColumns,
    resetResizing,
    state,
  } = useTableUtils(tableColumns, allData, defaultColumn, hiddenColumns);
  //#endregion //! Custom Hooks ▲▲▲▲▲▲

  const getTableBodyPropsMemo = useCallback(() => getTableBodyProps(), []);

  //#region ===Table Filter START===
  const handleFilter = useCallback(
    (e) => {
      e.preventDefault();
      filterProtocol(filterVal);
    },
    [filterVal]
  );

  const handleReset = useCallback(() => {
    setFilterVal(protocolFilterParams);
    resetFilter("protocol");
  }, []);
  //#endregion

  useEffect(() => {
    const params = makeUrlParams();
    getProtocolData(params + filterParams);
  }, [paginationParams, sortingParams, filterParams, searchTrigger]);

  useEffect(() => {
    if (!protocol?.entries) return;
    setAllData(protocol?.entries);
  }, [protocol]);

  useEffect(() => {
    // getBookingTypes();
    const x = localStorage.getItem("hiddenColumns/protocol");
    setHiddenColumns(JSON.parse(x));
  }, []);

  return (
    <>
      {error && <ErrorModal error={errorMsg} />}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        {contextMenu.show && (
          <ContextMenu
            allColumns={allColumns}
            X={contextMenu.x}
            Y={contextMenu.y}
            contextMenu={contextMenu}
            setContextMenu={setContextMenu}
            tableColumns={tableColumns}
            state={state}
          />
        )}
        <TableContainer component={Paper} sx={tableStyles.tableContainer}>
          <ProtocolFilter
            handleReset={handleReset}
            handleFilter={handleFilter}
            filterVal={filterVal}
            setFilterVal={setFilterVal}
          />

          <Box
            sx={{
              display: "flex",
              justifyContent: "end",
              columnGap: "15px",
              position: "sticky",
              top: -10,
              backgroundColor: "background.paper",
              opacity: 1,
              zIndex: 5,
            }}
          >
            {loading && <Loading_Icon />}

            <SSR_Pagination
              paginationParams={paginationParams}
              totalPages={protocol?.totalPages}
              table={"protocol"}
            />

            <Tooltip title="Spaltengröße rückgängig machen" arrow>
              <IconButton
                onClick={() => {
                  resetResizing();
                  setResetResize(!resetResize);
                }}
              >
                <UndoIcon />
              </IconButton>
            </Tooltip>

            <DownloadCSV rawData={allData} fileName={"mobile_buchungen"} />
            {user?.isAdmin && (
              <Tooltip title="Neuen Datensatz anlegen" arrow>
                <IconButton onClick={() => setOpenBookingModal(true)}>
                  <AddCircleIcon
                    sx={{
                      borderRadius: "10px",
                      color: "green",
                    }}
                  />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          <Table
            {...getTableProps()}
            sx={{ minWidth: 650 }}

            // onContextMenu={handleRightClick}
          >
            <CustomTableHead
              headerGroups={headerGroups}
              resetResize={resetResize}
              setResetResize={setResetResize}
              handleRightClick={handleRightClick}
              handleSortParams={handleSortParams}
              table={"protocol"}
            />
            <CustomTableBody
              resetResize={resetResize}
              getTableBodyProps={getTableBodyPropsMemo}
              prepareRow={prepareRow}
              page={page}
              TableRow={ProtocolTableRow}
              handleRightClick={handleRightClick}
            />
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default ProtocolTable;